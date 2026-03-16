<template>
	<view class="common-container">
		<!-- 刷新提示 -->
		<view class="refresh-tip" v-if="refreshing">
			<uni-icons type="refresh" size="24" color="#666" :spin="true"></uni-icons>
			<text class="refresh-text">正在刷新...</text>
		</view>

		<view class="alarms-list">
			<view v-if="loading" class="loading-state">
				<uni-load-more status="loading" />
				<text class="loading-text">加载中...</text>
			</view>

			<view v-else-if="!alarms.length" class="empty-state">
				<uni-icons type="compose" size="60" color="#ccc"></uni-icons>
				<text class="empty-text">暂无告警信息</text>
				<text class="empty-desc">系统运行正常</text>
			</view>

			<view v-else>
				<view class="alarm-card" v-for="(alarm, index) in alarms" :key="alarm.alarmId || index" @click="viewAlarm(alarm)">
					<view class="card-header">
						<view class="title-section">
							<text class="alarm-title">{{ alarm.alarmTitle }}</text>
							<view class="status-badge" :class="getStatusClass(alarm.status)">
								{{ getStatusText(alarm.status) }}
							</view>
						</view>
						<view class="level-badge" :class="getLevelClass(alarm.alarmLevel)">
							{{ getLevelText(alarm.alarmLevel) }}
						</view>
					</view>

					<view class="card-content">
						<view class="content-preview" v-if="alarm.alarmContent">
							<text class="content-text">{{ truncateContent(alarm.alarmContent) }}</text>
						</view>
						<view class="remark-preview" v-if="alarm.remark">
							<text class="remark-text">{{ truncateContent(alarm.remark, 30) }}</text>
						</view>
					</view>

					<view class="card-footer">
						<view class="time-info">
							<text class="time-label">触发：</text>
							<text class="time-value">{{ formatDate(alarm.triggerTime) }}</text>
						</view>
						<view class="time-info" v-if="alarm.handleTime">
							<text class="time-label">处理：</text>
							<text class="time-value">{{ formatDate(alarm.handleTime) }}</text>
						</view>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad, onUnload } from '@dcloudio/uni-app'
import { request } from '../../utils/api'

const alarms = ref([])
const loading = ref(false)
const refreshing = ref(false)
let pollTimer = null
let socketTask = null

function formatDate(dateStr) {
	if (!dateStr) return '未知时间'
	try {
		const d = new Date(dateStr)
		return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
	} catch (e) {
		return '时间格式错误'
	}
}

function isHandled(alarm) {
	return alarm && alarm.status === 2
}

function getStatusText(status) {
	const statusMap = {
		'0': '未处理',
		'1': '处理中',
		'2': '已处理',
		'3': '已忽略'
	}
	return statusMap[String(status)] || '未知状态'
}

function getStatusClass(status) {
	const classMap = {
		'0': 'status-pending',
		'1': 'status-processing',
		'2': 'status-handled',
		'3': 'status-ignored'
	}
	return classMap[String(status)] || 'status-unknown'
}

function getLevelText(level) {
	const levelMap = {
		'0': '低级',
		'1': '中级',
		'2': '高级',
		'3': '紧急'
	}
	return levelMap[String(level)] || '未知等级'
}

function getLevelClass(level) {
	const classMap = {
		'0': 'level-low',
		'1': 'level-medium',
		'2': 'level-high',
		'3': 'level-critical'
	}
	return classMap[String(level)] || 'level-unknown'
}

function truncateContent(content, maxLength = 50) {
	if (!content) return ''
	if (content.length <= maxLength) return content
	return content.substring(0, maxLength) + '...'
}

function fetchAlarms() {
	console.log('开始获取告警列表...')
	// 如果不是下拉刷新，则显示加载状态
	if (!refreshing.value) {
		loading.value = true
	}

	// simple GET with page params
	console.log('发送请求到 /mp/alarm/list?pageNum=1&pageSize=50')
	request({ url: '/mp/alarm/list?pageNum=1&pageSize=50', method: 'GET' }).then(res => {
		console.log('请求成功，返回数据：', res)
		alarms.value = res.rows || []
		loading.value = false

		// 如果是下拉刷新，停止刷新
		if (refreshing.value) {
			stopPullDownRefresh()
		}
	}).catch(err => {
		console.error('获取告警失败', err)
		loading.value = false

		// 如果是下拉刷新，停止刷新
		if (refreshing.value) {
			stopPullDownRefresh()
		}

		uni.showToast({
			title: '加载失败，请重试',
			icon: 'none'
		})
	})
}

// 下拉刷新
function onPullDownRefresh() {
	refreshing.value = true
	fetchAlarms()
}

// 停止下拉刷新
function stopPullDownRefresh() {
	uni.stopPullDownRefresh()
	refreshing.value = false
}

function refreshAlarms() {
	refreshing.value = true
	fetchAlarms()
}

function tryConnectSocket() {
	const BASE = 'https://yffxdq.cloud'
	// Spring Boot SockJS 默认暴露的原生 WebSocket 路径通常是 /ws/websocket
	const ws = BASE.replace(/^http/, 'ws') + '/ws/websocket'
	
	try {
		console.log('正在连接 WebSocket:', ws)
		socketTask = uni.connectSocket({
			url: ws,
			success: () => console.log('Socket 连接请求发送成功')
		})

		socketTask.onOpen(() => {
			console.log('Socket 连接已打开，发送 STOMP CONNECT')
			sendStompConnect()
		})

		socketTask.onMessage((res) => {
			handleStompMessage(res.data)
		})

		socketTask.onError((err) => {
			console.error('Socket 错误，将降级为轮询', err)
			socketTask = null
			startPolling()
		})
		
		socketTask.onClose(() => {
			console.log('Socket 已关闭')
			socketTask = null
		})
		
	} catch (e) {
		console.warn('连接 Socket 失败，降级为轮询', e)
		startPolling()
	}
}

function sendStompConnect() {
	// STOMP CONNECT 帧
	const frame = "CONNECT\naccept-version:1.1,1.0\nheart-beat:10000,10000\n\n\0"
	if (socketTask) {
		socketTask.send({ data: frame })
	}
}

function sendStompSubscribe() {
	// STOMP SUBSCRIBE 帧，订阅 /topic/alarm
	const frame = "SUBSCRIBE\nid:sub-0\ndestination:/topic/alarm\n\n\0"
	if (socketTask) {
		socketTask.send({ data: frame })
		console.log('已发送 STOMP SUBSCRIBE 订阅 /topic/alarm')
	}
}

function handleStompMessage(rawData) {
	if (!rawData) return

	// STOMP 帧以 NULL 字节 (\0) 结尾，可能包含多个帧
	const frames = rawData.split('\0')

	frames.forEach(frame => {
		// 忽略空帧或心跳换行符
		if (!frame || !frame.trim()) return

		if (frame.startsWith('CONNECTED')) {
			console.log('STOMP 连接成功')
			sendStompSubscribe()
		} else if (frame.startsWith('MESSAGE')) {
			// 解析 MESSAGE 帧
			// 统一换行符
			const normalized = frame.replace(/\r\n/g, '\n')
			// 头部和主体之间有两个换行符
			const bodyStart = normalized.indexOf('\n\n')

			if (bodyStart !== -1) {
				const body = normalized.substring(bodyStart + 2)
				try {
					if (body) {
						const alarm = JSON.parse(body)
						console.log('收到实时告警:', alarm)
						alarms.value.unshift(alarm)
						
						// 简单的提示
						uni.showToast({
							title: '新告警: ' + (alarm.alarmTitle || '未命名'),
							icon: 'none',
							duration: 2000
						})
					}
				} catch (e) {
					console.error('解析告警数据失败:', e)
				}
			}
		} else if (frame.startsWith('ERROR')) {
			console.error('STOMP 错误:', frame)
		}
	})
}

function startPolling() {
	if (pollTimer) return
	pollTimer = setInterval(() => {
		fetchAlarms()
	}, 30 * 1000)
}

onLoad(() => {
	fetchAlarms()
	tryConnectSocket()
	// if no socket, ensure polling started
	setTimeout(() => {
		if (!socketTask) startPolling()
	}, 1000)
})

// 页面下拉刷新
onPullDownRefresh(() => {
	refreshAlarms()
})

onUnload(() => {
	if (pollTimer) {
		clearInterval(pollTimer)
		pollTimer = null
	}
	if (socketTask) {
		socketTask.close()
		socketTask = null
	}
})

function viewAlarm(alarm) {
	uni.navigateTo({ url: `/pages/webview/webview?title=告警详情&content=${encodeURIComponent(alarm.alarmContent || '')}` })
}
</script>

<style lang="scss" scoped>
	.common-container {
		height: 100vh;
		overflow: auto;
		background-color: #f8fafc;
		padding: 0 16rpx;
	}

	.refresh-tip {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 20rpx 0;
		gap: 8rpx;

		.refresh-text {
			font-size: 26rpx;
			color: #666;
		}
	}

	.alarms-list {
		padding: 16rpx 0 100rpx;
	}

	.loading-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 80rpx 0;

		.loading-text {
			margin-top: 20rpx;
			font-size: 26rpx;
			color: #666;
		}
	}

	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 120rpx 0;
		color: #999;

		.empty-text {
			margin-top: 24rpx;
			font-size: 32rpx;
			color: #999;
		}

		.empty-desc {
			margin-top: 12rpx;
			font-size: 24rpx;
			color: #ccc;
		}
	}

	.alarm-card {
		background-color: #ffffff;
		border-radius: 12rpx;
		margin-bottom: 16rpx;
		padding: 24rpx;
		box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
		transition: all 0.2s ease;

		&:active {
			transform: scale(0.98);
			box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.1);
		}
	}

	.card-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 16rpx;
	}

	.title-section {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 8rpx;
	}

	.alarm-title {
		font-size: 32rpx;
		font-weight: 600;
		color: #1e293b;
		line-height: 1.4;
		word-break: break-word;
	}

	.status-badge {
		align-self: flex-start;
		padding: 4rpx 12rpx;
		border-radius: 12rpx;
		font-size: 20rpx;
		font-weight: 500;

		&.status-pending {
			background-color: #fef3c7;
			color: #d97706;
		}

		&.status-processing {
			background-color: #dbeafe;
			color: #2563eb;
		}

		&.status-handled {
			background-color: #d1fae5;
			color: #065f46;
		}

		&.status-ignored {
			background-color: #f3f4f6;
			color: #6b7280;
		}

		&.status-unknown {
			background-color: #f9fafb;
			color: #374151;
		}
	}

	.level-badge {
		padding: 4rpx 12rpx;
		border-radius: 12rpx;
		font-size: 20rpx;
		font-weight: 500;

		&.level-low {
			background-color: #ecfdf5;
			color: #065f46;
		}

		&.level-medium {
			background-color: #fef3c7;
			color: #d97706;
		}

		&.level-high {
			background-color: #fed7d7;
			color: #c53030;
		}

		&.level-critical {
			background-color: #7f1d1d;
			color: #ffffff;
		}

		&.level-unknown {
			background-color: #f3f4f6;
			color: #6b7280;
		}
	}

	.card-content {
		margin-bottom: 16rpx;
	}

	.info-row {
		display: flex;
		align-items: flex-start;
		margin-bottom: 8rpx;

		&:last-child {
			margin-bottom: 0;
		}
	}

	.label {
		font-size: 26rpx;
		color: #6b7280;
		min-width: 120rpx;
		flex-shrink: 0;
	}

	.value {
		font-size: 26rpx;
		color: #374151;
		flex: 1;
		word-break: break-word;
	}

	.content-preview, .remark-preview {
		margin-top: 12rpx;
		padding: 12rpx;
		background-color: #f8fafc;
		border-radius: 8rpx;
	}

	.content-text, .remark-text {
		font-size: 24rpx;
		color: #4b5563;
		line-height: 1.5;
		word-break: break-word;
	}

	.card-footer {
		border-top: 1rpx solid #e5e7eb;
		padding-top: 12rpx;
	}

	.time-info {
		display: flex;
		align-items: center;
		margin-bottom: 4rpx;

		&:last-child {
			margin-bottom: 0;
		}
	}

	.time-label {
		font-size: 22rpx;
		color: #9ca3af;
		min-width: 80rpx;
		flex-shrink: 0;
	}

	.time-value {
		font-size: 22rpx;
		color: #6b7280;
		flex: 1;
		word-break: break-word;
	}
</style>


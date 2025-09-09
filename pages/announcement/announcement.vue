<template>
	<view class="common-container">

		<!-- 公告列表 -->
		<view class="announcement-list">
			<uni-list>
				<uni-list-item v-for="(announcement, index) in announcements" :key="index" clickable
					@click="viewAnnouncement(announcement)">
					<template v-slot:body>
						<view class="list-item-content">
							<view class="title-time-container">
								<view class="item-title">{{ announcement.title }}</view>
								<view class="item-time">{{ formatDate(announcement.createTime) }}</view>
							</view>
						</view>
					</template>
				</uni-list-item>
			</uni-list>
			<view v-if="!announcements.length" class="empty-state">
				<text>暂无公告</text>
			</view>
		</view>

		<!-- 公告详情弹窗 -->
		<uni-popup ref="announcementDialog" type="dialog">
			<uni-popup-dialog type="info" cancelText="关闭" confirmText="了解" :title="selectedAnnouncement.title"
				@confirm="announcementDialog.close()">
				<view class="announcement-content">
					<text>{{ selectedAnnouncement.content }}</text>
					<view class="timestamp">
						<text>发布于: {{ formatDate(selectedAnnouncement.createTime) }}</text>
					</view>
				</view>
			</uni-popup-dialog>
		</uni-popup>
	</view>
</template>

<style lang="scss" scoped>
	.common-container {
		height: 100%;
		overflow-x: hidden;
		overflow-y: auto;
		background-color: #f5f6f8;
	}

	.announcement-list {
		margin: 24rpx;
		border-radius: 16rpx;
		background-color: #ffffff;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
	}

	uni-list-item {
		padding: 24rpx 32rpx;
		border-bottom: 1px solid #e8ecef;

		&:last-child {
			border-bottom: none;
		}

		::v-deep .list-item-content {
			display: flex;
			width: 100%;
		}

		::v-deep .title-time-container {
			display: flex;
			flex-direction: column;
			align-items: flex-start;
		}

		::v-deep .item-title {
			color: #1E3A8A;
			font-size: 32rpx; /* Larger font size for title */
			font-weight: 500;
			text-align: left;
		}

		::v-deep .item-time {
			color: #4B5EAA;
			font-size: 24rpx;
			margin-top: 8rpx;
			text-align: left;
		}
	}

	.empty-state {
		display: flex;
		justify-content: center;
		align-items: center;
		height: 300rpx;

		text {
			font-size: 28rpx;
			color: #4B5EAA;
		}
	}

	.announcement-content {
		padding: 20rpx;

		text {
			display: block;
			font-size: 28rpx;
			color: #1E3A8A;
			line-height: 1.6;
		}

		.timestamp {
			margin-top: 20rpx;

			text {
				font-size: 24rpx;
				color: #4B5EAA;
			}
		}
	}
</style>

<script setup>
	import { ref } from 'vue';
	import { onLoad } from '@dcloudio/uni-app';
	import { getAllAnnouncementItems } from '../../utils/api';

	const announcements = ref([]);
	const announcementDialog = ref(null);
	const selectedAnnouncement = ref({
		title: '',
		content: '',
		createTime: ''
	});

	// 返回上一页
	function goBack() {
		uni.navigateBack();
	}

	// 格式化日期
	function formatDate(dateStr) {
		const date = new Date(dateStr);
		return date.toLocaleDateString('zh-CN', {
			year: 'numeric',
			month: '2-digit',
			day: '2-digit',
			hour: '2-digit',
			minute: '2-digit'
		}).replace(/\//g, '-');
	}

	// 查看公告详情
	function viewAnnouncement(announcement) {
		selectedAnnouncement.value = announcement;
		announcementDialog.value.open();
	}

	// 页面加载时获取公告
	onLoad(() => {
		uni.showLoading({
			title: '加载中...',
			icon: 'none'
		});
		
		getAllAnnouncementItems().then(res => {
			announcements.value = res;
			console.log(announcements.value[0], "公告内容");
			uni.hideLoading();
		}).catch(err => {
			console.error('获取公告失败:', err);
			uni.hideLoading();
			uni.showToast({
				title: '网络错误，请重试',
				icon: 'none'
			});
		});
	});
</script>
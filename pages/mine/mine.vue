<template>
	<view class="common-container">
		<!-- 用户卡片 -->
		<view class="user-card">
			<image class="icon" src="../../static/myPage/lion.png" />
			<view class="right goto-login-btn">微信用户 yffang</view>
		</view>

		<!-- 功能 -->
		<view class="user-func">
			<view class="user-func_item" @click="clickItem('records')" hover-class="hover-view">
				<image class="icon" src="../../static/myPage/interview.png" mode="aspectFit" />
				<text class="txt">面试记录</text>
				<image class="right-icon" src="../../static/myPage/arrow.png" mode="aspectFit" />
			</view>
			<view class="user-func_item" @click="clickItem('announcement')" hover-class="hover-view">
				<image class="icon" src="../../static/myPage/announcement.png" mode="aspectFit" />
				<text class="txt">平台公告</text>
				<image class="right-icon" src="../../static/myPage/arrow.png" mode="aspectFit" />
			</view>
			<view class="user-func_item" @click="clickItem('satisfaction')" hover-class="hover-view">
				<image class="icon" src="../../static/myPage/satisfaction.png" mode="aspectFit" />
				<text class="txt">满意度调查</text>
				<image class="right-icon" src="../../static/myPage/arrow.png" mode="aspectFit" />
			</view>
			<view class="user-func_item" @click="clickItem('about')" hover-class="hover-view">
				<image class="icon" src="../../static/myPage/about.png" mode="aspectFit" />
				<text class="txt">关于</text>
				<image class="right-icon" src="../../static/myPage/arrow.png" mode="aspectFit" />
			</view>
		</view>
		<view>
			<!-- 关于弹窗 -->
			<uni-popup ref="alertDialog" type="dialog">
				<uni-popup-dialog type="info" cancelText="关闭" confirmText="了解" title="关于我们">
					<view class="about-content">
						<view class="info-item">
							<text class="label">版本: </text>
							<text class="value">1.10.0</text>
						</view>
						<view class="info-item">
							<text class="label">开发者: </text>
							<text class="value">yffang</text>
						</view>
						<view class="info-item">
							<text class="label">联系方式: </text>
							<text class="value">1136714194@qq.com</text>
						</view>
					</view>
				</uni-popup-dialog>
			</uni-popup>
			<!-- 满意度调查弹窗 -->
			<uni-popup ref="satisfactionDialog" type="dialog">
				<uni-popup-dialog type="info" cancelText="取消" confirmText="提交" title="您对本应用的满意度如何？"
					@confirm="submitSatisfaction">
					<view class="satisfaction-content">
						<view class="rating-label">请为我们评分</view>
						<view class="star-rating">
							<text v-for="star in 5" :key="star" class="star" 
								:class="{ filled: star <= selectedRating }" 
								@click="selectRating(star)">★</text>
						</view>
						<view v-if="selectedRating" class="selected-rating">
							您选择了：{{ ratingText(selectedRating) }} ({{ selectedRating }} 星)
						</view>
						<textarea v-model="feedback" placeholder="请留下您的建议（可选）" class="feedback-input"></textarea>
					</view>
				</uni-popup-dialog>
			</uni-popup>
		</view>
	</view>
</template>

<style lang="scss" scoped>
	.common-container {
		height: 100%;
		overflow-x: hidden;
		overflow-y: auto;
		background-color: #f5f6f8;
	}

	/* Hover effect */
	.hover-view {
		background-color: #e8ecef;
		transition: background-color 0.2s ease;
	}

	/* User card styles */
	.user-card {
		display: flex;
		align-items: center;
		height: 300rpx;
		padding: 32rpx 40rpx;
		background: linear-gradient(180deg, #3b82f6 0%, #93c5fd 100%);
		border-radius: 16rpx;
		margin: 24rpx;
		margin-bottom: 10rpx;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

		.icon {
			width: 120rpx;
			height: 120rpx;
			border-radius: 50%;
			margin-right: 32rpx;
			object-fit: cover;
		}

		.goto-login-btn {
			display: flex;
			align-items: center;
			font-size: 36rpx;
			font-weight: 500;
			color: #ffffff;
			line-height: 1.5;
		}
	}

	/* Function list styles */
	.user-func {
		margin: -24rpx 24rpx 0;
		border-radius: 16rpx;
		background-color: #ffffff;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
		overflow: hidden;

		.user-func_item {
			display: flex;
			align-items: center;
			height: 120rpx;
			padding: 0 32rpx;
			border-top: 1px solid #e8ecef;
			transition: background-color 0.2s ease;

			&:first-child {
				border-top: none;
			}

			.icon {
				width: 48rpx;
				height: 48rpx;
				margin-right: 24rpx;
				flex-shrink: 0;
				object-fit: contain;
			}

			.txt {
				flex-grow: 1;
				font-size: 32rpx;
				font-weight: 500;
				color: #1f2937;
				line-height: 1.5;
			}

			.right-icon {
				width: 40rpx;
				height: 40rpx;
				flex-shrink: 0;
				object-fit: contain;
				opacity: 0.6;
			}
		}
	}

	/* Popup dialog styles */
	uni-popup-dialog {
		.about-content {
			padding: 32rpx;
			display: flex;
			flex-direction: column;
			gap: 24rpx;
			background-color: #ffffff;
			border-radius: 12rpx;

			.info-item {
				display: flex;
				justify-content: space-between;
				align-items: center;
				padding: 16rpx 0;
				border-bottom: 1px solid #e8ecef;

				&:last-child {
					border-bottom: none;
				}

				.label {
					font-size: 28rpx;
					font-weight: 500;
					color: #1E3A8A;
				}

				.value {
					font-size: 28rpx;
					color: #1f2937;
				}
			}
		}

		/* 自定义按钮样式 */
		::v-deep .uni-popup__wrapper-box {
			.uni-popup-dialog__buttons {
				display: flex;
				justify-content: space-between;
				padding: 16rpx 32rpx;

				.uni-button {
					border-radius: 12rpx;
					font-size: 28rpx;
					transition: all 0.2s ease;

					&[type="default"] {
						background-color: #ffffff;
						border: 1px solid #3b82f6;
						color: #3b82f6;
						&:hover {
							background-color: #f5f6f8;
						}
					}

					&[type="primary"] {
						background-color: #3b82f6;
						color: #ffffff;
						&:hover {
							background-color: #2b4cb8;
						}
					}
				}
			}
		}
	}

	/* 满意度调查弹窗样式 */
	.satisfaction-content {
		padding: 32rpx;
		display: flex;
		flex-direction: column;
		gap: 24rpx;
		background-color: #ffffff;
		border-radius: 12rpx;

		.rating-label {
			font-size: 32rpx;
			font-weight: 500;
			color: #1E3A8A;
			text-align: center;
		}

		.star-rating {
			display: flex;
			justify-content: center;
			gap: 16rpx;
			padding: 16rpx;
		}

		.star {
			font-size: 48rpx;
			color: #d1d5db;
			transition: all 0.2s ease;
			&.filled {
				color: #f59e0b;
			}
			&:hover {
				transform: scale(1.1);
			}
		}

		.selected-rating {
			font-size: 28rpx;
			color: #1E3A8A;
			text-align: center;
			font-weight: 500;
		}

		.feedback-input {
			width: 100%;
			height: 160rpx;
			border: 1px solid #e8ecef;
			border-radius: 12rpx;
			padding: 16rpx;
			font-size: 28rpx;
			background-color: #ffffff;
			color: #1f2937;
			&:focus {
				border-color: #3b82f6;
				box-shadow: 0 0 8px rgba(59, 130, 246, 0.2);
			}
		}
	}
</style>

<script setup>
	import { ref, getCurrentInstance } from 'vue';
	const { proxy } = getCurrentInstance();
	import { postSatisfaction } from '../../utils/api';

	let alertDialog = ref(null);
	let satisfactionDialog = ref(null);
	let selectedRating = ref(0);
	let feedback = ref('');

	// 评分对应的文本
	function ratingText(rating) {
		const texts = {
			5: '非常满意',
			4: '满意',
			3: '一般',
			2: '不满意',
			1: '非常不满意'
		};
		return texts[rating];
	}

	// 选择评分的函数
	function selectRating(rating) {
		selectedRating.value = rating;
	}

	function createSatisfactionSurvey(rating, feedback) {
		return {
			rating: rating,
			feedback: feedback || ''
		};
	}

	// 提交满意度函数
	function submitSatisfaction() {
		if (selectedRating.value === 0) {
			uni.showToast({
				title: '请选择满意度',
				icon: 'none'
			});
			return;
		}
		postSatisfaction(createSatisfactionSurvey(selectedRating.value, feedback.value)).then(res => {
			uni.showToast({
				title: '提交成功，感谢反馈！',
				icon: 'success'
			});
			satisfactionDialog.value.close();
			selectedRating.value = 0;
			feedback.value = '';
		}).catch(err => {
			console.error('提交失败:', err);
			uni.showToast({
				title: '网络错误，请重试',
				icon: 'none'
			});
		});
	}

	function clickItem(item) {
		if (item === 'about') {
			proxy.$refs.alertDialog.open();
		} else if (item === 'records') {
			uni.navigateTo({
				url: '/pages/records/records'
			});
		} else if (item === 'satisfaction') {
			satisfactionDialog.value.open();
		} else if (item === 'announcement') {
			uni.navigateTo({
				url: '/pages/announcement/announcement'
			});
		}
	}
</script>
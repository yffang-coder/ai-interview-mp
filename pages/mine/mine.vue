<template>
	<view class="common-container">
		<!-- 用户卡片 -->
		<view class="user-card">
			<image class="icon" :src="userAvatar" />
			<view class="right">
				<text class="username">{{ userName }}</text>
			</view>
			<text class="edit-text" @click="showEditProfile">编辑</text>
		</view>

		<!-- 功能 -->
		<view class="user-func">
			<view class="user-func_item" @click="clickItem('records')" hover-class="hover-view">
				<image class="icon" src="../../static/myPage/interview.png" mode="aspectFit" />
				<text class="txt">面试记录</text>
				<image class="right-icon" src="../../static/myPage/arrow.png" mode="aspectFit" />
			</view>
			<view class="user-func_item" @click="clickItem('about')" hover-class="hover-view">
				<image class="icon" src="../../static/myPage/about.png" mode="aspectFit" />
				<text class="txt">关于</text>
				<image class="right-icon" src="../../static/myPage/arrow.png" mode="aspectFit" />
			</view>
			<view class="user-func_item" @click="clickItem('satisfaction')" hover-class="hover-view">
				<image class="icon" src="../../static/myPage/satisfaction.png" mode="aspectFit" />
				<text class="txt">满意度调查</text>
				<image class="right-icon" src="../../static/myPage/arrow.png" mode="aspectFit" />
			</view>
			<view class="user-func_item" @click="clickItem('announcement')" hover-class="hover-view">
				<image class="icon" src="../../static/myPage/announcement.png" mode="aspectFit" />
				<text class="txt">平台公告</text>
				<image class="right-icon" src="../../static/myPage/arrow.png" mode="aspectFit" />
			</view>
		</view>
		<view>
			<!-- 关于弹窗 -->
			<uni-popup ref="alertDialog" type="dialog">
				<uni-popup-dialog type="info" cancelText="关闭" confirmText="了解" title="关于我们">
					<view class="about-content">
						<view class="info-item">
							<text class="label">版本</text>
							<text class="value">1.10.0</text>
						</view>
						<view class="info-item">
							<text class="label">开发者</text>
							<text class="value">yffang</text>
						</view>
						<view class="info-item">
							<text class="label">联系方式</text>
							<text class="value">0524-1788899</text>
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
							<text v-for="star in 5" :key="star" class="star" :class="{ filled: star <= selectedRating }"
								@click="selectRating(star)">★</text>
						</view>
						<view v-if="selectedRating" class="selected-rating">
							您选择了：{{ ratingText(selectedRating) }} ({{ selectedRating }} 星)
						</view>
						<textarea v-model="feedback" placeholder="请留下您的建议（可选）" class="feedback-input"></textarea>
					</view>
				</uni-popup-dialog>
			</uni-popup>
			<!-- 编辑用户信息弹窗 -->
			<uni-popup ref="editProfileDialog" type="dialog">
				<uni-popup-dialog type="info" cancelText="取消" confirmText="保存" title="编辑用户信息" @confirm="saveProfile">
					<view class="edit-profile-content">
						<view class="avatar-section">
							<image :src="tempAvatar || userAvatar" class="edit-avatar" @click="chooseAvatar" />
							<text class="avatar-tip">点击头像更换</text>
						</view>
						<view class="name-section">
							<text class="name-label">用户名</text>
							<input v-model="tempName" placeholder="请输入用户名" class="name-input" type="text"
								maxlength="20" />
						</view>
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
		position: relative;
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

		.right {
			display: flex;
			flex-direction: column;
			flex-grow: 1;

			.username {
				font-size: 36rpx;
				font-weight: 500;
				color: #ffffff;
				line-height: 1.5;
			}
		}

		.edit-text {
			position: absolute;
			top: 24rpx;
			right: 24rpx;
			font-size: 28rpx;
			color: #e0e7ff;
			text-decoration: underline;
			transition: color 0.2s ease;

			&:hover {
				color: #ffffff;
			}
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

	/* 编辑用户信息弹窗样式 */
	.edit-profile-content {
		padding: 40rpx;
		display: flex;
		flex-direction: column;
		gap: 32rpx;
		background-color: #ffffff;

		.avatar-section {
			display: flex;
			flex-direction: column;
			align-items: center;
			gap: 16rpx;

			.edit-avatar {
				width: 180rpx;
				height: 180rpx;
				border-radius: 50%;
				object-fit: cover;
				border: 3px solid #e8ecef;
				transition: transform 0.2s ease;

				&:hover {
					transform: scale(1.05);
				}
			}

			.avatar-tip {
				font-size: 24rpx;
				color: #6b7280;
				text-align: center;
			}
		}

		.name-section {
			display: flex;
			flex-direction: column;
			gap: 12rpx;

			.name-label {
				font-size: 28rpx;
				font-weight: 500;
				color: #1E3A8A;
			}

			.name-input {
				width: 100%;
				height: 65rpx;
				border: 1px solid #e8ecef;
				border-radius: 12rpx;
				padding: 10rpx;
				font-size: 20rpx;
				color: #1f2937;
				background-color: #f9fafb;
				transition: all 0.2s ease;

				&:focus {
					border-color: #3b82f6;
					box-shadow: 0 0 8px rgba(59, 130, 246, 0.2);
					background-color: #ffffff;
				}
			}
		}
	}
</style>

<script setup>
	import {
		ref,
		getCurrentInstance
	} from 'vue';
	const {
		proxy
	} = getCurrentInstance();
	import {
		postSatisfaction,
		getUserInfo,
		postUserInfo
	} from '../../utils/api';
	import {
		onLoad
	} from '@dcloudio/uni-app';

	let alertDialog = ref(null);
	let satisfactionDialog = ref(null);
	let editProfileDialog = ref(null);
	let selectedRating = ref(0);
	let feedback = ref('');
	let userAvatar = ref('../../static/myPage/lion.png'); // 默认头像
	let userName = ref('微信用户 yffang'); // 默认用户名
	let tempAvatar = ref(''); // 临时头像，用于预览
	let tempName = ref(''); // 临时用户名，用于编辑

	onLoad(() => {
		// 初始化头像
		getUserInfo()
			.then((res) => {
				console.log('获取信息成功:', res);
				if (res.avatarUrl) {
					userAvatar.value = res.avatarUrl;
				} else {
					//url 不存在则用默认头像替代
					userAvatar.value = '../../static/myPage/lion.png';
				}
				userName.value = res.username;
			})
			.catch((err) => {
				console.error('获取信息失败:', err);
			});
	});

	// 评分对应的文本
	function ratingText(rating) {
		const texts = {
			5: '非常满意',
			4: '满意',
			3: '一般',
			2: '不满意',
			1: '非常不满意',
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
			feedback: feedback || '',
		};
	}

	// 提交满意度函数
	function submitSatisfaction() {
		if (selectedRating.value === 0) {
			uni.showToast({
				title: '请选择满意度',
				icon: 'none',
			});
			return;
		}
		postSatisfaction(createSatisfactionSurvey(selectedRating.value, feedback.value))
			.then((res) => {
				uni.showToast({
					title: '提交成功，感谢反馈！',
					icon: 'success',
				});
				satisfactionDialog.value.close();
				selectedRating.value = 0;
				feedback.value = '';
			})
			.catch((err) => {
				console.error('提交失败:', err);
				uni.showToast({
					title: '网络错误，请重试',
					icon: 'none',
				});
			});
	}

	// 显示编辑用户信息弹窗
	function showEditProfile() {
		tempAvatar.value = ''; // 清空临时头像
		tempName.value = userName.value; // 初始化临时用户名
		editProfileDialog.value.open();
	}

	// 选择头像
	function chooseAvatar() {
		uni.chooseImage({
			count: 1,
			sizeType: ['compressed'],
			sourceType: ['album', 'camera'],
			success: (res) => {
				tempAvatar.value = res.tempFilePaths[0];
			},
		});
	}

	function createUserInfo(username, avatar) {
		return {
			username: username,
			avatar: avatar,
		};
	}

	// 保存用户信息
	function saveProfile() {
		if (!tempName.value.trim()) {
			uni.showToast({
				title: '用户名不能为空',
				icon: 'none',
			});
			return;
		}

		uni.showLoading({
			title: '正在保存...',
		});

		const userInfo = createUserInfo(tempName.value, tempAvatar.value || userAvatar.value);
		postUserInfo(userInfo)
			.then((res) => {
				console.log('更新信息成功:', res)
				let response = res
				if (response.data.avatarUrl) {
					userAvatar.value = response.data.avatarUrl
				} else {
					//url 不存在则用默认头像替代
					userAvatar.value = '../../static/myPage/lion.png'
				}
				userName.value = response.data.username
				uni.showToast({
					title: '保存成功',
					icon: 'success'
				});
				editProfileDialog.value.close()
			})
			.catch((err) => {
				console.error('保存失败:', err)
				uni.showToast({
					title: '网络错误，请重试',
					icon: 'none'
				});
			})
			.finally(() => {
				uni.hideLoading()
			});
	}

	function clickItem(item) {
		if (item === 'about') {
			proxy.$refs.alertDialog.open();
		} else if (item === 'records') {
			uni.navigateTo({
				url: '/pages/records/records',
			});
		} else if (item === 'satisfaction') {
			satisfactionDialog.value.open();
		} else if (item === 'announcement') {
			uni.navigateTo({
				url: '/pages/announcement/announcement',
			});
		}
	}
</script>
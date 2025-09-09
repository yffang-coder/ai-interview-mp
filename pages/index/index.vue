<template>
	<view class="content">
		<swiper circular style="height: 210px;" :indicator-dots="indicatorDots" :autoplay="autoplay"
			:interval="interval" :duration="duration">
			<swiper-item v-for="(banner, index) in banners" :key="index">
				<image style="width: 100%;background-color: #eeeeee;" :src="banner.image" @click="bannerClick(banner)">
				</image>
			</swiper-item>
		</swiper>
		<uni-grid :column="3" :show-border="true" :square="false" @change="gridItemClick">
			<uni-grid-item v-for="(cate, index) in categories" :index="index" :key="index">
				<view class="grid-item-box">
					<image :src="cate.src" mode="aspectFill" class="image"></image>
					<text class="text">{{cate.text}}</text>
				</view>
			</uni-grid-item>
		</uni-grid>
	</view>
</template>

<style>
	.content {
		padding: 16px;
		background-color: #f8f9fa;
	}

	/* Swiper styles */
	swiper {
		border-radius: 12px;
		overflow: hidden;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
		margin-bottom: 10px;
	}

	swiper-item image {
		width: 100%;
		height: 240px;
		object-fit: cover;
		transition: opacity 0.3s ease;
	}

	swiper-item image:hover {
		opacity: 0.95;
	}

	/* Grid styles */
	.grid-item-box {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 12px;
		border-radius: 8px;
		background-color: #ffffff;
		transition: transform 0.2s ease, box-shadow 0.2s ease;
	}

	.grid-item-box:hover {
		transform: translateY(-4px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
	}

	.image {
		width: 56px;
		height: 56px;
		border-radius: 12px;
		object-fit: cover;
		margin-bottom: 8px;
	}

	.text {
		font-size: 13px;
		font-weight: 500;
		color: #333;
		text-align: center;
		line-height: 1.4;
	}
</style>

<script setup>
	import {
		ref
	} from "vue";
	import {
		getAllBanners,
		getAllCategories
	} from "../../utils/api";
	import {
		onLoad
	} from '@dcloudio/uni-app';

	let indicatorDots = ref(true)
	let autoplay = ref(true)
	let interval = ref(5000)
	let duration = ref(1000)
	let banners = ref([])
	let categories = ref([])

	function gridItemClick(event) {
		let cate = categories.value[event.detail.index]
		console.log(categories.value[event.detail.index])
		if (cate.enable) {
			console.log(cate.name)
			uni.navigateTo({
				url: '/pages/interview/interview?cate=' + cate.name
			});
		} else {
			uni.showToast({
				title: '快马加鞭制作中',
				duration: 2000,
				icon: "none"
			})
		}
	}

	function bannerClick(data) {
		uni.setStorage({
			key: 'wvUrl',
			data: data.url,
			success() {
				uni.navigateTo({
					url: '/pages/webview/webview'
				});
			}
		})
	}

	onLoad(() => {
		uni.getStorage({
			key: 'banners',
			success: res => {
				banners.value = res.data
			},
			fail: err => {
				uni.showLoading({
					title: '数据加载中...'
				});
				getAllBanners().then(res => {
					banners.value = res
					uni.setStorage({
						key: 'banners',
						data: res
					});
				}).catch(err => {
					console.log(err);
				});
			}
		});

		uni.getStorage({
			key: 'cates',
			success: res => {
				categories.value = res.data
			},
			fail: err => {
				uni.showLoading({
					title: '数据加载中...'
				});
				getAllCategories().then(res => {
					categories.value = res
					uni.setStorage({
						key: 'cates',
						data: res
					});
				}).catch(err => {
					console.log(err);
				});
			}
		});
	});
</script>
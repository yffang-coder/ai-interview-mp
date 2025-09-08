<template>
	<view v-if="record">
	  <uni-card v-if="record.question">
	    <view>
	      <uni-tag text="面试题" type="primary"></uni-tag>
		  <view class="container">
		  	<!-- 默认用法 直接传入md文本即可 普通md展示-->
		  	<zero-markdown-view :markdown="record.question.content"></zero-markdown-view>
		  </view>
	   <!--   <view class="content">{{record.question.content}}</view> -->
	    </view>
	  </uni-card>
	  <uni-card v-if="record.answer">
	    <view>
	      <uni-tag text="你的答案" type="success"></uni-tag>
		  <view class="container">
		  	<!-- 默认用法 直接传入md文本即可 普通md展示-->
		  	<zero-markdown-view :markdown="record.answer.category"></zero-markdown-view>
		  </view>
	<!--      <view class="content">{{record.answer.category}}</view> -->
	    </view>
	  </uni-card>
	  <uni-card v-if="record.answer">
	    <view>
	      <uni-tag text="面试" type="warning"></uni-tag>
		  <view class="container">
		  	<!-- 默认用法 直接传入md文本即可 普通md展示-->
		  	<zero-markdown-view :markdown="record.answer.content"></zero-markdown-view>
		  </view>
	      <!-- <view class="content">{{record.answer.content}}</view> -->
	    </view>
	  </uni-card>
	</view>
</template>

<script setup>
	import {
		ref
	} from 'vue';

	import {
		onLoad
	} from '@dcloudio/uni-app';


	let record = ref(null)
	
	onLoad(() =>{
		uni.getStorage({
			key:'record_item',
			success: res =>{
				record.value = res.data
			}
		})
	})
</script>

<style>
.content{
	margin-top: 8px;
}
</style>
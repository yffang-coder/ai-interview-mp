<template>
	<view>
		<z-paging ref="paging" v-model="records" @query="queryList">
			<template #top>
				<view class="filter-container">
					<!-- Subject Filter (Main and Sub-subject) -->
					<uni-data-picker v-model="select" :localdata="subjectTree" @change="handleSubjectChange"
						class="subject-picker" placeholder="选择面试分类" :clear-icon="true" />
					<!-- <tki-tree ref="tkitree" :range="range" :rangeKey="rangeKey" confirmColor="#4e8af7" /> -->
					<!-- Date Range Picker -->
					<uni-datetime-picker v-model="dateRange" type="datetimerange" @change="handleDateChange"
						class="date-picker" :clear-icon="true" :format="'yyyy-MM-dd HH:mm'" 
						placeholder="选择时间范围" />
				</view>
			</template>
			<uni-card v-for="(item, index) in records" :key="index" @click="recordDetail(item)">
				<text>{{ item.question.content }}</text>
				<view style="margin-top: 8px;">
					<uni-tag :text="item.question.subject" type="warning"></uni-tag>
					<uni-tag :text="item.question.category" type="success" style="margin-left: 8px;"></uni-tag>
					<uni-tag :text="item.question.createTime" type="default" style="margin-left: 8px;"></uni-tag>
				</view>
			</uni-card>
		</z-paging>
	</view>
</template>

<script setup>
	import {
		ref,
		getCurrentInstance
	} from 'vue';
	import {
		getAllRecords,
		getAllMenus
	} from '../../utils/api';
	import {
		onLoad
	}
	from '@dcloudio/uni-app';

	const paging = ref(null);
	const records = ref([]);
	const dateRange = ref([]);
	const select = ref([]);
	const subjectFilter = ref('all');
	const categoryItemFilter = ref('all');

	const {
		proxy
	} = getCurrentInstance();

	const subjectTree = ref([]);

	onLoad((options) => {

		uni.getStorage({
			key: 'menus',
			success: (res) => {
				console.log('加载本地菜单数据', res.data)
				subjectTree.value = res.data
			},
			fail: (err) => {

				getAllMenus().then((res) => {
					console.log('加载菜单数据', res)
					subjectTree.value = res
					uni.setStorage({
						key: 'menus',
						data: res
					})
				})
			}
		})

	})

	function recordDetail(data) {
		uni.setStorage({
			key: 'record_item',
			data: data,
			success() {
				uni.navigateTo({
					url: '/pages/record_details/record_details'
				});
			}
		});
	}

	function handleSubjectChange(e) {

		// 用户更改科目筛选（subjectFilter）或时间范围（dateRange）时，调用 paging.value.reload() 会让 z-paging 组件重新加载数据列表。
		// 它会重新调用 queryList(pageNo, pageSize) 方法，且 pageNo 会被重置为 1，
		// 同时将最新的筛选参数（mainSubject、subSubject、startDate、endDate）传递给你的 API 请求。
		console.log('选中的值:', e);
		if (e.detail.value.length > 1) {
			uni.showToast({
				title: '筛选中...',
				icon: 'none'
			});
			subjectFilter.value = e.detail.value[0].value
			categoryItemFilter.value = e.detail.value[1].value
			paging.value.reload()
		} else {
			//点击 右侧的关闭按钮触发
			uni.showToast({
				title: '重置中...',
				icon: 'none'
			});
			select.value = []
			subjectFilter.value = 'all'
			categoryItemFilter.value = 'all'
			paging.value.reload()
		}
	}

	function handleDateChange(value) {
		uni.showToast({
			title: '筛选时间...',
			icon: 'none'
		});
		paging.value.reload();
	}

	function queryList(pageNo, pageSize) {
		uni.showToast({
			title: '正在加载历史数据',
			icon: 'none'
		});

		const startDate = dateRange.value[0] ?
			Math.floor(new Date(dateRange.value[0]).getTime() / 1000) :
			undefined;
		const endDate = dateRange.value[1] ?
			Math.floor(new Date(dateRange.value[1]).getTime() / 1000) :
			undefined;
		// Set subSubject to 'all' if no sub-subject is selected
		// const subSubject = subjectFilter && subjectFilter.value && subjectFilter.value.length > 1 
		//   ? subjectFilter.value 
		//   : 'all';
		// console.log(subSubject+"===")

		getAllRecords(subjectFilter.value, categoryItemFilter.value, pageNo, startDate, endDate).then(res => {
			proxy.$refs.paging.complete(res);
		}).catch(err => {
			proxy.$refs.paging.complete(false);
		})
	}
</script>

<style scoped>
  .filter-container {
    padding: 15px;
    background-color: #ffffff;
    border-bottom: 1px solid #e0e0e0;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
    gap: 15px;
  }

  .subject-picker {
    margin-bottom: 0;
  }

  .date-picker {
    width: 100%;
  }

  :deep(.uni-data-picker) {
    border-radius: 12px;
    border: 1px solid #dcdcdc;
    background-color: #fafafa;
    padding: 10px 15px;
    font-size: 16px;
    color: #333;
    transition: all 0.3s ease;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  }

  :deep(.uni-data-picker__input) {
    text-align: left;
  }

  :deep(.uni-datetime-picker) {
    border-radius: 12px;
    border: 1px solid #dcdcdc;
    background-color: #fafafa;
    padding: 10px 15px;
    font-size: 16px;
    color: #333;
    transition: all 0.3s ease;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  }

  :deep(.uni-card) {
    margin: 10px;
    border-radius: 12px;
    background-color: #ffffff;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    transition: transform 0.2s ease;
  }

  :deep(.uni-card__content) {
    padding: 15px;
  }

  :deep(.uni-card):hover {
    transform: translateY(-2px);
  }

  :deep(.uni-tag) {
    border-radius: 10px;
    padding: 4px 12px;
    font-size: 14px;
    margin-right: 8px;
  }

  :deep(.uni-tag--warning) {
    background-color: #ffeb3b;
    color: #333;
  }

  :deep(.uni-tag--success) {
    background-color: #4caf50;
    color: #fff;
  }

  :deep(.uni-tag--default) {
    background-color: #e0e0e0;
    color: #666;
  }

  text {
    font-size: 16px;
    color: #444;
    line-height: 1.5;
  }
</style>
const BASE_URL = 'https://yffxdq.cloud/prod-api'
//const BASE_URL = 'http://127.0.0.1:8080'
export const request = (options) => {
	return new Promise((resolve, reject) => {
		let expire_time = uni.getStorageSync('login_expire_time');
		if (expire_time && expire_time > new Date().getTime()) {
			handleRequest(options, resolve, reject)
		} else {
			uni.login({
				provider: 'weixin', //使用微信登录
				success: function(loginRes) {
					uni.request({
						url: BASE_URL + '/mp/login', //仅为示例，并非真实接口地址。
						data: {
							code: loginRes.code
						},
						method: "POST",
						header: {
							'content-type': 'application/x-www-form-urlencoded' //自定义请求头信息
						},
						success: (res) => {
							console.log(res.data);
							uni.setStorage({
								key: 'user_info',
								data: res.data.data,
								success: function() {
									uni.setStorage({
										key: 'login_expire_time',
										data: new Date()
											.getTime() + 3600 *
											1000
									})
									handleRequest(options, resolve,
										reject)
								}
							});
						}
					});
				}
			});
		}
	})
}

export const handleRequest = (options, resolve, reject) => {
	uni.request({
		url: BASE_URL + options.url, //仅为示例，并非真实接口地址。
		data: options.data,
		method: options.method,
		header: {
			'content-type': 'application/json',
			//自定义请求头信息
			'openid': uni.getStorageSync('user_info').openid,
			'mp_token': uni.getStorageSync('user_info').session_key
		},
		success: (res) => {
			return resolve(res.data)
		},
		fail: error => {
			return reject(error)
		},
		complete: () => {
			uni.hideLoading()
		}
	});
}

export const getAllBanners = () => {
	return request({
		url: '/mp/banners',
		method: 'GET'
	});
};

export const getAllCategories = () => {
	return request({
		url: '/mp/categories',
		method: 'GET'
	});
};

export const getAllModels = () => {
	return request({
		url: '/mp/models',
		method: 'GET'
	});
};

export const getAllMenus = () => {
	return request({
		url: '/mp/records/menu',
		method: 'GET'
	});
};

export const getAllCategoryItems = (item) => {
	return request({
		url: '/mp/categories/' + item,
		method: 'GET'
	});
};

export const getAllAnnouncementItems = () => {
	return request({
		url: '/mp/announcements',
		method: 'GET'
	});
};

export const chat = (data) => {
	return request({
		url: '/mp/chat',
		method: 'POST',
		data: data
	});
};

export const postSatisfaction = (data) => {
	return request({
		url: '/mp/satisfaction',
		method: 'POST',
		data: data
	});
};

export const getUserInfo = () => {
	return request({
		url: '/mp/userinfo',
		method: 'GET',
	});
};

export const postUserInfo = (data) => {
	return new Promise((resolve, reject) => {
		const {
			username,
			avatar
		} = data;
		//==宽松相等比较自动类型转换适用于不关心类型的场景（不推荐频繁使用）
		//===严格相等比较无类型转换推荐用于模板、计算属性和逻辑处理，确保可靠性和可预测性
		if (avatar && (avatar.startsWith('http://tmp') === false || avatar == '../../static/myPage/lion.png')) {
			// If avatar is a local file path, use uni.uploadFile
			console.log("本地文件路径" + avatar)
			uni.request({
				url: BASE_URL + '/mp/userinfo',
				method: 'POST',
				header: {
					'content-type': 'application/x-www-form-urlencoded',
					'openid': uni.getStorageSync('user_info').openid,
					'mp_token': uni.getStorageSync('user_info').session_key
					
				},
				data: {
					username: username
				},
				success: (res) => {
					resolve(res.data)
				},
				fail: (error) => {
					reject(error);
				},
				complete: () => {
					uni.hideLoading();
				}
			});
		} else {
			// If no new avatar or avatar is a URL, use regular request
			uni.uploadFile({
				url: BASE_URL + '/mp/userinfo',
				method: 'POST',
				header: {
					'content-type': 'application/x-www-form-urlencoded',
					'openid': uni.getStorageSync('user_info').openid,
					'mp_token': uni.getStorageSync('user_info').session_key
				},
				filePath: avatar, // 临时文件路径
				name: 'avatar', // 对应后端 @RequestParam("avatar")
				formData: {
					username: username // 其他字段
				},
				success: (res) => {
					let a = JSON.parse(res.data)
					//res是个字符串 需要转化为json obj
					resolve(a)
				},
				fail: (err) => {
					reject(err)
				}
			});
		}
	});
};

export const getAllRecords = (subject, category, pageNum, startTime, endTime) => {
	// 构建 URL，依次添加参数
	let url =
		`/mp/records?subject=${encodeURIComponent(subject)}&category=${encodeURIComponent(category)}&pageNum=${pageNum}`;

	// 如果 startTime 存在，添加到 URL
	if (startTime) {
		url += `&startTime=${startTime}`;
	}

	// 如果 endTime 存在，添加到 URL
	if (endTime) {
		url += `&endTime=${endTime}`;
	}
	console.log(url)
	return request({
		url: url,
		method: 'GET'
	});
};
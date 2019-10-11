/**
 * @param {Object} root
 * @param {Function} factory
 */
! function(root, store) {
	if (typeof module === 'object' && module.exports)
		module.exports = store();
	else
		root.$store = store();
}(typeof window !== 'undefined' ? window : this, function() {
	var __onstoreEvents = {}, //仓库对象
		__cnt = 0, // 统计事件的次数
		string_str = 'string',//string
		function_str = 'function',//function
		hasOwnKey = Function.call.bind(Object.hasOwnProperty);//判断对象中是否含有某个属性
		slice = Function.call.bind(Array.prototype.slice);//slice截取
/**
 * @description 
 * @param {String} eventName 事件名
 * @param {Function} callback 回调函数
 * @param {Number} is_one 事件次数
 * @param {Object} context 携带的数据
 * @return {Array} 返回一个事件名元素，和事件次数组成的数组
 */
	function _bind(eventName, callback, is_one, context) {
		//类型检测
		if (typeof eventName !== string_str || typeof callback !== function_str) {
			throw new Error('args: ' + string_str + ', ' + function_str + '');
		}
		//事件仓库中没有这个事件，我就添加一个事件
		if (!hasOwnKey(__onstoreEvents, eventName)) {
			__onstoreEvents[eventName] = {};
		}
		//给这个事件的数字属性添加
		__onstoreEvents[eventName][++__cnt] = [callback, is_one, context];
		
		//事件名，和总事件次数
		return [eventName, __cnt];
	}


/**
 * @description 处理对象中的遍历，利用回调拿取数据，类似数组的forEach
 * @param {Object} obj 遍历对象
 * @param {Function} callback 回调函数
 */
	function _each(obj, callback) {
		for (var key in obj) {
			if (hasOwnKey(obj, key)) callback(key, obj[key]);
		}
	}
	
	//监听（读取数据）（context是回调的上下文）
	function on(eventName, callback, context) {
		return _bind(eventName, callback, 0, context);
	}
	
	//监听一次（在触发一次后销毁）
	function one(eventName, callback, context) {
		return _bind(eventName, callback, 1, context);
	}


	//存储
	function _store_func(eventName, args) {
		if (hasOwnKey(__onstoreEvents, eventName)) {
			_each(__onstoreEvents[eventName], function(key, item) {
				item[0].apply(item[2], args); // do the function
				if (item[1]) delete __onstoreEvents[eventName][key]; // when is one, delete it after triggle
			});
		}
	}
	
	//触发事件
	function emit(eventName) {
		// store events
		var args = slice(arguments, 1);
		setTimeout(function() {
			_store_func(eventName, args);
		});
	}


//异步触发
	function emitSync(eventName) {
		_store_func(eventName, slice(arguments, 1));
	}
//删除数据(根据事件名，对象，函数其中一个删除函数)
	function un(event) {
		var eventName, key, r = false,
			type = typeof event;
		if (type === string_str) {//字符串类型处理
			// cancel the event name if exist
			if (hasOwnKey(__onstoreEvents, event)) {
				delete __onstoreEvents[event];
				return true;
			}
			return false;
		} else if (type === 'object') {
			eventName = event[0];
			key = event[1];
			if (hasOwnKey(__onstoreEvents, eventName) && hasOwnKey(__onstoreEvents[eventName], key)) {
				delete __onstoreEvents[eventName][key];
				return true;
			}
			// can not find this event, return false
			return false;
		} else if (type === function_str) {
			_each(__onstoreEvents, function(key_1, item_1) {
				_each(item_1, function(key_2, item_2) {
					if (item_2[0] === event) {
						delete __onstoreEvents[key_1][key_2];
						r = true;
					}
				});
			});
			return r;
		}
		return true;
	}
	/**
	 * 清空仓库
	 */
	function clear() {
		__onstoreEvents = {};
	}
	//抛出方法
	return {
		on,
		one,
		un,
		emit,
		emitSync,
		clear
	};
});

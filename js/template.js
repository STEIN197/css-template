function main(){
	setScalable(); // Убрать зум на смартфонах
	$(".dropdown.dropdown-tabs").each(initDropdown); // Если есть табы превращающиеся в выпадающий список
	$("#burger").click(initBurger); // Переключение бургера
	$(".slider").each(initSlick); // Автоматическая инициализация слайдера
	$.lz();
	initMfp(); // Автоматическая инициализация попапа
	$(window).scroll();
	$(window).resize();
	$(".js-anchor").click(anchorView);
}

var $body = $("body");
var $header = $("header");
var $footer = $("footer");
var $menubar = $("#menubar");
var $sidebar = $("#sidebar");
var $burger = $("#burger");
var $modal = $("#modal");

/**
 * Автоматическая инициализация слайдера
**/
function initSlick(){
	var $this = $(this);
	var settings = {};
	var data = $this.data("slick");
	if(data){
		settings = data;
	}
	$wrapper = $this.closest(".slider-wrapper");
	$btnswrapper = $wrapper.find(".slider-btns");
	$dotswrapper = $wrapper.find(".slider-dots");
	if($btnswrapper.length){
		$.extend(settings, {
			appendArrows: $btnswrapper
		});
	}
	if($dotswrapper.length){
		$.extend(settings, {
			appendDots: $dotswrapper
		});
	}
	$this.slick(settings);
}

/**
 * Переключение табов через выпадающий список
**/
function initDropdown(){
	var $this = $(this);
	var $target = $($this.data("target"));
	$this.find(".dropdown-item").click(function($e){
		$e.preventDefault();
		var $item = $(this);
		var link = $item.attr("href");
		$item
			.closest(".dropdown")
			.children("button")
			.text($item.text());
		$target
			.find(sformat("a[href='%1']", link))
			.click();
	});
}
/**
 * Включение-выключение меню для мобильных и планшетов
**/
function initBurger($e){
	var $this = $(this);
	if($menubar.hasClass("expanded")){
		$menubar.removeClass("expanded");
		$menubar.animate({
			"opacity": 0
		}, {
			complete: function(){
				$menubar.css("display", "none");
				$body.removeClass("fixed");
			}
		});
	} else {
		$menubar.addClass("expanded");
		$body.addClass("fixed");
		$menubar.css("display", "block");
		$menubar.animate({
			"opacity": 1
		});
	}
}

/**
 * Автоматическая инициализация галереи
**/
function initMfp(){
	$(".js-gallery").each(function(idx){
		var $this = $(this);
		$this.find(".item-mfp").magnificPopup({
			type: "image",
			gallery: {
				enabled: true
			}
		})
	});
}

/* 
 * Плавная прокрутка
 */
function anchorView($e){
	var $this = $(this);
	var data = $this.attr("href").split("#");
	var page = data[0] || location.pathname;
	var target = data[1];
	if(location.pathname !== page){
		return;
	} else {
		$e.preventDefault();
		if($menubar.is(".expanded")){
			$burger.click();
		}
		$("html, body").animate({
			scrollTop: $(sformat("#%1", target)).offset().top - $header.height()
		}, $this.data("speed") ? $this.data("speed") / 1 : undefined);
	}
}

function initGoogleMaps(selector){
	selector = selector || ".gmap";
	var $maps = $(selector);
	$maps.each(function(){
		var $this = $(this);
		var data = $this.data("map");
		data = $.extend({
			zoom: 13,
			center: null,
			scrollwheel: false,
			zoomControl: true,
			streetViewControl: false,
			mapTypeId: google.maps.MapTypeId.ROADMAP
		}, data);
		var map = new google.maps.Map(this, data);
		var marker = new google.maps.Marker({
			position: new google.maps.LatLng(data.center.lat, data.center.lng),
			map: map,
			icon: data.icon,
		});
		var infowindow = new google.maps.InfoWindow({
			content: format(data.content),
		});
		google.maps.event.addListener(marker, "click", function(){
			infowindow.open(map, marker);
		});
	});
}

function changeFilename(wrapper, label, close){
	wrapper = wrapper || ".file";
	label = label || ".filename";
	close = close || ".fileremove";
	var defaultText = $(label).text();
	// var maxwidth = $(label).outerWidth();
	// $(label).css("max-width", maxwidth);

	// Show filename
	$("input[type='file']").change(function($e){
		var $this = $(this);
		var $wrapper = $this.closest(wrapper);
		var $label = $wrapper.find(label);
		var $close = $wrapper.find(close);
		var filename = $this
			.val()
			.replace(/.*\\(.*)/, "$1")
			.replace(/.*\/(.*)/, "$1");
		$label.text(filename ? filename : defaultText);
		$close
			.removeClass("o-0")
			.addClass("cp");
	});
	// Remove file
	$(close).click(function($e){
		var $this = $(this);
		$this
			.addClass("o-0")
			.removeClass("cp")
			.closest(wrapper)
			.find(label)
			.val("")
			.text(defaultText)
	})
}

var Form = {
	init: function(selector){
		$("input[name='user-phone']").inputmask({
			mask: "+7(999)999-99-99",
			showMaskOnHover: false
		});
		$(".btn-validate").click(Form.validate);
		Form.selector = selector || "form";
	},

	validate: function($e){
		$e.preventDefault();
		var $this = $(this);
		var $form = $this.closest(Form.selector);
		var $inputs = $form.find("*.required");
		var $checkbox = $form.find("input[type='checkbox']");
		var isValid = true;
		var regexp, value, input;
		// Р’Р°Р»РёРґР°С†РёСЏ РїРѕР»РµР№
		$inputs.each(function(){
			regexp = new RegExp(this.getAttribute("data-regexp"));
			value = this.value;
			var matches = regexp.test(value);
			isValid &= matches;
			if(matches){
				Form.onSuccess(this);
			} else {
				Form.onFailure(this);
			}
		});
		// Р’Р°Р»РёРґР°С†РёСЏ С„Р»Р°Р¶РєР°
		if(!$checkbox.is(":checked")){
			Form.onFailure($checkbox.get(0));
			isValid = false;
		} else {
			Form.onSuccess($checkbox.get(0));
		}

		if(isValid){
			if($form.is(".ajax")){
				var data = {};
				var $input;
				$form.find("input:not([type='checkbox']), textarea").each(function(){
					$input = $(this);
					data[$input.attr("name")] = $input.val();
				});
				$form.find("input[type='checkbox']").each(function(){
					$input = $(this);
					data[$input.attr("name")] = $input.is(":checked");
				});
				$.post($this.attr("href"), data, function(data, status){
					console.log(data);
				});
			} else {
				$form.submit();
			}
		}
	},

	onFailure: function(context){
		var $input = $(context);
		if($input.is("[type='checkbox']")){
			$input
				.next()
				.addClass("error");
		} else {
			$input
				.addClass("error")
				.removeClass("success")
				.next("span.warn")
				.addClass("active");
		}
	},

	onSuccess: function(context){
		var $input = $(context);
		if($input.is("[type='checkbox']")){
			$input
				.next()
				.removeClass("error");
		} else {
			$input
				.removeClass("error")
				.addClass("success")
				.next("span.warn")
				.removeClass("active");
		}
	}
}

// Убирает зум на сматрфонах
function setScalable(){
	if(screen.width < 768){
		var $viewport = $("meta[name='viewport']");
		var metadata = $viewport.attr("content");
		$viewport.attr("content", sformat("%1, user-scalable=no", metadata));

	}
}

!function($){
	var opts = {
		cover: {
			class: "js-cover",
			adaptive: true
		},
		lazyload: {
			class: "js-lazyload",
		}
	};
	var fn = {
		isInViewport: function(element){
			var box = element.getBoundingClientRect();
			var isInViewportT = 0 <= box.top && box.top <= innerHeight;
			var isInViewportB = 0 <= box.bottom && box.bottom <= innerHeight;
			return isInViewportT || isInViewportB;
		},
		showImage: function($image){
			var covered = $image.is("." + opts.cover.class) ? $image.is(".covered") : true;
			var loaded = $image.is("." + opts.lazyload.class) ? $image.is(".loaded") : true;
			if(covered && loaded)
				$image.animate({
					opacity: 1
				}, 500)
		},
		onLoadCover: function(idx){
			if(!this.width && !this.height)
				return;
			var $image = $(this);
			var $parent = $image.parent();
			$image.addClass("center");
			$parent.addClass("crop");
			var dimens = {
				parent: {
					x: $parent.outerWidth(),
					y: $parent.outerHeight(),
				},
				image: {
					x: $image.width(),
					y: $image.height(),
				}
			}
			var ratio = {
				parent: dimens.parent.x / dimens.parent.y,
				image: dimens.image.x / dimens.image.y
			}
			$image.data("ratio", ratio.image);
			fn.setCover($image, ratio);
			$image.addClass("covered");
			fn.showImage($image);
		},
		onWindowScroll: function($e){
			var $list = $("img." + opts.lazyload.class + ":not(.loaded)");
			$list.each(function(){
				var $image = $(this);
				if(fn.isInViewport(this))
					$image.attr("src", $image.data("src"));
			});
		},
		loadLazy: function(i){
			if(!this.width && !this.height)
				return;
			var $this = $(this);
			var box = $this.is("." + opts.cover.class) ? $this.parent() : $this;
			box = box[0];
			if(fn.isInViewport(box)){
				$this.on("load", function(){
					$this.addClass("loaded");
					fn.showImage($this);
				});
				$this.attr("src", $this.data("src"));
			}
		},
		onLoadLazy: function($e){
			var $image = $(this);
			$image.addClass("loaded");
			fn.showImage($image);
		},
		coverOnResize: function(i){
			var $image = $(this);
			var $parent = $image.parent();
			var imageRatio = $image.data("ratio");
			ratio = {
				parent: $parent.outerWidth() / $parent.outerHeight(),
				image: imageRatio
			}
			fn.setCover($image, ratio);
		},
		setCover: function($image, ratio){
			if(ratio.parent > ratio.image){
				$image.css({
					width: "100%",
					height: "auto"
				});
			} else {
				$image.css({
					width: "auto",
					height: "100%"
				});
			}
		}
	};
	$.lz = function(options){
		opts = $.extend(opts, options);
		var $window = $(window);
		$("img." + opts.cover.class).on("load", fn.onLoadCover);
		$("img." + opts.cover.class).trigger("load");
		$("img." + opts.lazyload.class).on("load", fn.onLoadLazy);
		$window.on("scroll load", fn.onWindowScroll);
		if(opts.cover.adaptive){
			$window.resize(function(){
				$("img." + opts.cover.class).each(fn.coverOnResize);
			});
		}
	}
}(jQuery);

/**
 * Форматирует строку с указанными параметрами
 * @param {string} str Строка для форматирования
 * @param {(object|array)} [data=window] Данные
 * @param {string} [delimiter="%"] Разделитель
 * @param {string} [levelDelimiter] Разделитель уровней, если объект имеет сложную структуру
 * @return {string}
 * @version 1.1
**/
function format(str, data, delimiter, levelDelimiter){
	// Установка стандартных настроек
	data = data || window;
	delimiter = delimiter || "%";
	levelDelimiter = levelDelimiter || ".";
	// Получение регулярного выражения
	var reg = new RegExp(delimiter + ".+?" + delimiter, "g");
	var formatted = str.replace(reg, function(match, offset, string){
		match = match.slice(1, -1);
		var levels = match.split(levelDelimiter);
		var nest = levels.length;
		var curLvl = data[levels[0]];
		if(curLvl === undefined){
			return "";
		}
		for(var i = 1; i < nest; i++){
			curLvl = curLvl[levels[i]];
			if(curLvl === undefined){
				return "";
			}
		}
		return curLvl;
	});
	return formatted;
}

/**
 * Простое форматирование текста данными. Принимает неограниченное количество аргументов
 * @param {string} str Строка для форматирования
 * @return {string} Отформатированную строку
 * @version 1.2
**/
function sformat(str){
	var data = arguments;
	var length = data.length - 1;
	var reg = new RegExp("%\\d+", "g");
	var formatted = str.replace(reg, function(match){
		var pos = match.slice(1) / 1;
		if(pos >= data.length){
			return "";
		}
		var rest = "";
		while(length < pos){
			rest = pos.toString().slice(-1) + rest;
			pos = Math.floor(pos / 10);
		}
		return data[pos] + rest;
	});
	return formatted;
}

/**
* Устанавливает, меняет и удаляет куки. Для работы нужен class.js
* @param {string|object} [key] Имя куки или набор куки
* @param {string} [value] Значение куки
* @param {number} [lifetime] Время жизни кук в секундах
* @param {string} [path] Путь до куки
* @return {(string|object|undefined|boolean)} Одиночное значение | Все куки | Куки не найдено | Установлено новое значение
* @version 1.5
**/
function $_COOKIE(key, value, path, lifetime){
	var cookie = document.cookie.split(";");
	// Получить все куки массивом
	if(key === undefined){
		var result = {
			keys: [],
			values: []
		}
		var item = "";
		for(var i = 0; i < cookie.length; i++){
			item = cookie[i].trim().split("=");
			result.keys.push(item[0]);
			result.values.push(item[1]);
		}
		return result;
	// Установить/удалить набор
	} else if(value === undefined){
		// Вернуть одно значение
		if(typeof key === "string"){
			var keyName = "";
			var result = "";
			for(var i = 0; i < cookie.length; i++){
				var pair = cookie[i].trim().split("=");
				keyName = pair[0];
				if(keyName === key){
					return pair[1];
				}
			}
			return undefined;
		// Установить набор значений или удалить все куки
		} else {
			// Если key - массив содержащий хотя бы один ключ
			if(Array.isArray(key) && key.length){
				var l = key.length;
				for(var i = 0; i < l; i++){
					$_COOKIE(key[i].name, key[i].value, key[i].lifetime, key[i].path);
				}
			// Если key - объект содержащий хотя бы один ключ
			} else if(Object.keys(key).length > 0){
				for(var prop in key){
					$_COOKIE(prop, key[prop]);
				}
			// Удалить все куки
			} else {
				cookie = $_COOKIE();
				var cookieLength = cookie.keys.length;
				for(var i = 0; i < cookieLength; ++i){
					$_COOKIE(cookie.keys[i], "");
				}
				return true;
			}
		}
	// Установить одно значение или удалить
	} else {
		// Удалить куки
		if(value === ""){
			document.cookie = key + "=;max-age=-99999999;expires=Thu, 01 Jan 1970 00:00:01 GMT";
			if($_COOKIE(key) !== undefined) throw new Error(sformat("Cookie with key \"%1\" cannot be removed", key));
		// Установить одно значение
		} else {
			path = path || "/";
			// Если указано время жизни
			if(lifetime !== undefined){
				document.cookie = format("%key%=%value%;max-age=%lifetime%;path=%path%", {
					key: key,
					value: value,
					path: path,
					lifetime: lifetime,
				});
			// Если был указан путь
			} else {
				document.cookie = format("%key%=%value%;path=%path%", {
					key: key,
					value: value,
					path: path,
				});
			}
		}
		return true;
	}
}

/**
* Устанавливает, меняет и удаляет параметры query-строки. Доступно в IE10+
* @param {string|object} [key] Имя параметра или набор параметров
* @param {string} [value] Значение параметра
* @return {(string|object|undefined|boolean)} Одиночное значение | Все get-параметры | Параметр(-ы) не найдены | Установлено новое значение
* @throws {Error} Если браузер не поддерживает метод
* @version 1.2
**/
function $_GET(key, value){
	if(!history.pushState) throw new Error("Your browser does not support \"history.pushState\" method");
	var url = location.href;
	var query = url.split("?")[1];
	// Вернуть список всех query-параметров или undefined, если список пуст
	if(!key){
		if(!query) return undefined;
		query = query.split("&");
		var queryLength = query.length;
		var result = param =[];
		result = {
			keys: [],
			values: []
		};
		for(var i = 0; i < queryLength; ++i){
			param = query[i].split("=");
			result.keys.push(param[0]);
			result.values.push(param[1]);
		}
		return result;
	// Вернуть одно значение или undefined, если нет, или очистить всю query-строку
	} else if(value === undefined){
		if(typeof key === "string"){
			if(!query) return undefined;
			query = query.split("&");
			var val = query.find(function(v, i, a){
				var keyName = v.split("=")[0];
				return keyName === key;
			});
			if(val === undefined) return undefined;
			else return val.split("=")[1];
		// Установить набор значений
		} else if(Object.keys(key).length){
			for(var prop in key){
				$_GET(prop, key[prop]);
			}
		// Очистить query-строку
		} else {
			var params = $_GET();
			for(var i = 0; i < params.keys.length; i++){
				$_GET(params.keys[i], "");
			}
		}
	// Установаить или удалить одно значение
	} else {
		// Удалить одно значение
		if(value === ""){
			if(!$_GET(key)) return true;
			query = query.split("&");
			query = query.filter(function(v, i, a){
				var curVal = v.split("=")[0];
				if(key === curVal) return false;
				return true;
			});
			query = query.join("&");
			url = location.protocol + "//" + location.host + location.pathname + (query ? "?" + query : "");
			history.pushState({
				path: url
			}, "", url);
			return true;
		// Установить
		} else {
			query = query ? query.split("&") : [];
			var val = $_GET(key);
			if(val == value) return true;
			if(val === undefined) query.push(key + "=" + value);
			else{
				var index = query.indexOf(key + "=" + val);
				query[index] = key + "=" + value;
			}
			query = query.join("&");
			url = location.protocol + "//" + location.host + location.pathname + "?" + query;
			history.pushState({
				path: url
			}, "", url);
			return true;
		}
	}
}

$(main);
(function(factory) {
    "use strict";
    if (typeof define === 'function' && define.amd) {
        define(['jquery'], factory);
    } else if (typeof module !== 'undefined' && module.exports) {
        module.exports = factory(require('jquery'));
    } else {
        factory(jQuery);
    }
}(function($, undefined) {
    "use strict";

    //if ($.inputselector) return; //判断inputseletor有没有被初始化过

    var Inputselector = function(element, options) {
        this.$element = $(element);
        this.options = $.extend({}, Inputselector.defaults, options);
        this.variable = {
            $boxWrap: null,
            $tabWrap: null,
            $selectorWrap: null,
            $inputWrap: null,
            wrapId: null,
            count: 0,
            pagination: { //分页相关参数
                pageCount: 0,
                currentPage: -1,
                witchCountInPage: 0
            }
        };
        this.inputEvent();
    };

    Inputselector.defaults = {
        data: [], //数据格式为：[京|jing|j','津|jin|j','沪|hu|h','渝|yu|y']
        title: '支持拼音输入', //控件标题
        hotDataTitle: '热门', //热点数据标题
        dataTitle: '', //提供不分类时的数据标题
        hotDataCount: 3, //热点数据
        defaultValue: '京', //input默认值
        contentWidth: '310px', //content框的宽度
        contentHeight: null, //content框的高度，默认为null，表示高度自适应；如果指定高度，将可能出现滚动条
        isTab: true, //是否是tab形式显示
        isClassification: true, //是否进行分类
        isPaginator: true, //是否进行分页，如果isTab和isClassfication同时为true,selectWrap实现分页，如果只有isPaginator为true,则只有inputWrap分页
        paginatorRowCount: 7, //多少行为一页
        cellClass: 'is-tab-cell', //单个数据的样式
        calculateDataCount: function() { //计算SelectorWrap时每一页的数据条数
            return parseInt(310 / 45) * this.paginatorRowCount;
        },
        wrapId: null //为selector外包框指定id
    };

    /*公有方法*/
    Inputselector.prototype = {
        createContainer: function() { //创建选择内容
            var $containerBox,
                inputPos = _methods.getPos(this.$element);

            if (!this.options.wrapId) {
                this.variable.wrapId = this.$element.attr('id').trim() + '-inputselector';
            } else {
                this.variable.wrapId = this.options.wrapId;
            };
            $containerBox = $('<div id="' + this.variable.wrapId + '" class="is-box-wrap"></div>').css({
                left: inputPos.left + 'px',
                top: inputPos.bottom + 'px'
            }).append(this.createSelectorWrap());
            return $containerBox;
        },
        createTitle: function(titleContent) { //创建标题
            var $title = $('<p class="is-title">' + titleContent + '</p>');
            return $title;
        },
        createSelectorWrap: function() { //选择时的外包框
            var $selectorWrap;
            if (!this.variable.$selectorWrap) {
                $selectorWrap = $('<div class="is-selector-wrap"></div>');
                if (this.options.title) { //是否设置标题
                    $selectorWrap.append(this.createTitle(this.options.title));
                };
                this.variable.$selectorWrap = $selectorWrap.append(this.createTab());
            };
            return $selectorWrap;
        },
        createInputWrap: function(value) { //输入时的外包框
            var $inputWrap;

            if (!this.variable.$inputWrap) {
                $inputWrap = $('<div class="is-input-wrap"></div>');

                if (this.options.title) {
                    $inputWrap.html(this.createTitle('按"' + value + '"检索'));
                };
                $inputWrap.append(this.createUl(value));
                this.variable.$inputWrap = $inputWrap;
                return $inputWrap;
            } else {
                this.variable.$inputWrap.empty();
                if (this.options.title) {
                    this.variable.$inputWrap.append(this.createTitle('按"' + value + '"检索'));
                };
                this.variable.$inputWrap.append(this.createUl(value));
                return;
            };
        },
        createTab: function() { //创建tab外包框
            var $tabContent = $('<div class="is-tab-wrap"></div>'),
                strUlCell = '',
                classData, hotData, $tabName;

            if (this.options.contentHeight) {
                $tabContent.css({
                    'height': this.options.contentHeight,
                    'overflow-y': 'auto'
                });
            };
            if (this.options.contentWidth) {
                $tabContent.css('width', this.options.contentWidth);
            };
            if (this.options.isPaginator) {
                this.variable.pagination.witchCountInPage = this.options.calculateDataCount();
            };
            classData = this.classifyData(_methods.sortPlaceData(this.options.data, true)); //对数据进行排序和分类
            hotData = this.createHotData(); //热点数据解析

            if (this.options.isTab) {

                if (classData) {
                    $tabName = $('<ul class="is-nav-tabs"></ul>');
                    if (hotData && hotData.title) {
                        $tabName.append(hotData.title);
                        strUlCell += hotData.value;
                    };
                    $.each(classData, $.proxy(function(index, el) {
                        if (el.value.length > 0) {
                            $tabName.append('<li data-tab="' + this.variable.wrapId + '-' + el.id + '">' + el.name + '</li>');
                            strUlCell += this.createContent(el);
                        };
                    }, this));
                    $tabContent.append($tabName).append($(strUlCell).addClass('hide'));
                };
            } else {
                if (classData) {
                    if (hotData && hotData.title) {
                        $tabContent.append(hotData.title).append(hotData.value);
                    };
                    $.each(classData, $.proxy(function(index, el) {
                        if (el.value.length > 0) {
                            if (el.name) {
                                $tabContent.append('<div class="line"></div>').append('<p>' + el.name + '</p>').append(this.createContent(el));
                            } else {
                                $tabContent.append(this.createContent(el));
                            }

                        };
                    }, this));
                };
            };
            this.variable.$tabWrap = $tabContent;
            return $tabContent;
        },
        createHotData: function() { //创建热点区域相应页面代码
            var result, hotArr;
            if (this.options.hotDataCount > 0) {
                hotArr = _methods.sortPlaceData(this.options.data.slice(0, this.options.hotDataCount), false);
                result = {
                    title: '',
                    value: ''
                };
                if (this.options.isTab) {
                    result.title = '<li data-tab="' + this.variable.wrapId + '-hotData">' + this.options.hotDataTitle + '</li>';
                } else {
                    result.title = '<p>' + this.options.hotDataTitle + '</p>';
                };
                result.value = this.createContent({
                    id: 'hotData',
                    name: this.options.hotDataTitle,
                    value: hotArr
                });
            };

            return result;
        },
        createContent: function(item) { //生成一个内容页
            var strUl = '';
            if (typeof item === "object" && item.value.length > 0) {
                if (this.options.isTab && this.options.isPaginator && this.options.paginatorRowCount > 0) {
                    strUl = '<ul id="' + this.variable.wrapId + '-' + item.id + '" class="is-content-ul"  data-wrap="tabwrap">';
                    this.variable.pagination.pageCount = Math.ceil(item.value.length / this.variable.pagination.witchCountInPage);
                    for (var i = 0; i < this.variable.pagination.pageCount; i++) {
                        strUl += '<div data-page="' + i.toString() + '" class="hide">' + this.createSelectorPage(item.value.slice(i * this.variable.pagination.witchCountInPage, (i + 1) * this.variable.pagination.witchCountInPage)).join('') + '</div>';
                    };
                    if (this.variable.pagination.pageCount > 1) {
                        strUl += '<div class="is-inputWrap-footer"><a href="#" class="is-flip" name="' + this.variable.wrapId + '-pageBackward">  上一页</a><a href="#" class="is-instruction" name="' + this.variable.wrapId + '-pageInstruction"></a><a href="#" class="is-flip" name="' + this.variable.wrapId + '-pageForward">下一页  </a></div>';
                    };
                } else {
                    strUl += '<ul id="' + this.variable.wrapId + '-' + item.id + '" class="is-content-ul">';
                    $.map(item.value, $.proxy(function(elem, index) {
                        strUl += '<li class="is-cell ' + this.options.cellClass + '">' + elem[1] + '</li>';
                    }, this));
                };

                strUl += '</ul>';
            };
            return strUl;
        },
        createSelectorPage: function(arr) {
            var str = '',
                result = [];
            if (arr) {
                $.map(arr, $.proxy(function(elem, index) {
                    str += '<li class="is-cell ' + this.options.cellClass + '">' + elem[1] + '</li>';
                }, this));
                result.push(str);
            };
            return result;
        },
        classifyData: function(arr) { //分类函数，该函数可在外部进行定义，返回的是一个分类数组
            var result;
            if (arr.length > 0) {
                if (this.options.isClassification) {
                    var reg1 = /^[a-e]$/i,
                        reg2 = /^[f-j]$/i,
                        reg3 = /^[k-o]$/i,
                        reg4 = /^[p-t]$/i,
                        reg5 = /^[u-z]$/i;
                    result = {
                        ae: {
                            id: 'ae',
                            name: 'A-E',
                            value: []
                        },
                        fj: {
                            id: 'fj',
                            name: 'F-J',
                            value: []
                        },
                        ko: {
                            id: 'ko',
                            name: 'K-O',
                            value: []
                        },
                        pt: {
                            id: 'pt',
                            name: 'P-T',
                            value: []
                        },
                        uz: {
                            id: 'uz',
                            name: 'U-Z',
                            value: []
                        }
                    };

                    arr.map(function(elem, index) {
                        var letter = elem[3].toUpperCase();
                        if (reg1.test(letter)) {
                            result.ae.value.push(elem);
                        } else if (reg2.test(letter)) {
                            result.fj.value.push(elem);
                        } else if (reg3.test(letter)) {
                            result.ko.value.push(elem);
                        } else if (reg4.test(letter)) {
                            result.pt.value.push(elem);
                        } else if (reg5.test(letter)) {
                            result.uz.value.push(elem);
                        };
                    });

                } else {
                    result = {
                        all: {
                            id: 'allCell',
                            name: this.options.dataTitle,
                            value: arr
                        }
                    };
                };
            };
            return result;
        },
        createUl: function(value) {
            var reg, searchResult = [],
                matchData = [],
                str, match, $ul = $('<ul class="is-ul-wrap" data-wrap="ulwrap"></ul>');
            reg = new RegExp("^" + value + "|\\|" + value, 'gi');
            $.map(this.options.data, function(elem, index) {
                if (reg.test(elem)) {
                    matchData.push(elem);
                };
            });

            // 如果搜索数据为空
            if (matchData.length == 0) {
                str = '<li class="empty">对不起，没有找到数据 "<em>' + value + '</em>。"</li>';
                searchResult.push(str);
            } else {
                if (this.options.isPaginator) {
                    this.variable.pagination.pageCount = Math.ceil(matchData.length / this.options.paginatorRowCount);
                    for (var i = 0; i < this.variable.pagination.pageCount; ++i) {
                        str = '<div data-page="' + i.toString() + '" class="hide">' + this.createUlPage(matchData.slice(i * this.options.paginatorRowCount, (i + 1) * this.options.paginatorRowCount)).join('') + '</div>';
                        searchResult.push(str);
                    };
                } else {
                    searchResult = this.createUlPage(matchData);
                };
            };

            $ul.append(searchResult.join(''));
            if (this.options.isPaginator && this.variable.pagination.pageCount > 1) {
                $ul.append('<div class="is-inputWrap-footer"><a href="#" class="is-flip" name="' + this.variable.wrapId + '-pageBackward">  &lt; 向后</a><a href="#" class="is-instruction" name="' + this.variable.wrapId + '-pageInstruction"></a><a href="#" class="is-flip" name="' + this.variable.wrapId + '-pageForward">向前 &gt;  </a></div>');
            };
            return $ul;
        },
        createUlPage: function(arr) { //生成一个ul页
            var result = [],
                match, str;
            if (arr) {
                $.map(arr, $.proxy(function(elem, index) {
                    match = _variable.regEx.exec(elem);
                    if (result.length !== 0) {
                        str = '<li class="is-cell"><b class="is-data-name">' + match[1] + '</b><b class="is-data-spell">' + match[2] + '</b></li>';
                    } else {
                        this.variable.count = 0;
                        str = '<li class="on is-cell"><b class="is-data-name">' + match[1] + '</b><b class="is-data-spell">' + match[2] + '</b></li>';
                    };
                    result.push(str);
                }, this));
            };
            return result;
        },
        toggleHideWrap: function(wrapType, hide) { //各种框的显隐切换
            var subToggleHideWrap = $.proxy(function($subWrap, subHide) { //该函数意义为设置selectorWrap隐藏
                if ($subWrap) {
                    if (subHide) {
                        $subWrap.addClass('hide');
                    } else {
                        if (this.variable.$boxWrap.hasClass('hide')) {
                            this.variable.$boxWrap.removeClass('hide');
                        };
                        $subWrap.removeClass('hide');
                    };
                };
            }, this);
            switch (wrapType) {
                case 1:
                    if (this.variable.$boxWrap) {
                        if (hide) {
                            this.variable.$boxWrap.addClass('hide');
                        } else {
                            this.variable.$boxWrap.removeClass('hide');
                        };
                    };
                    break;
                default:
                    if (this.variable.$boxWrap) {
                        subToggleHideWrap(this.variable.$selectorWrap, hide);
                        subToggleHideWrap(this.variable.$inputWrap, !hide);
                    };
                    break;
            };
        },
        pagination: function(pageNum, $pageElem) { //分页方法，$pageElem为页的外包元素
            if (pageNum === this.variable.pagination.currentPage) return false;
            if (pageNum >= 0 && pageNum < this.variable.pagination.pageCount) {
                $pageElem.children('div[data-page]').addClass('hide');
                $pageElem.children('div[data-page="' + pageNum.toString() + '"]').removeClass('hide');
                this.variable.pagination.currentPage = pageNum;
                return true;
            };
            return false;
        },
        inputEvent: function() {
            this.$element.val(this.options.defaultValue); //给input赋默认值
            this.$element
                .on('click.is', $.proxy(function(e) { //鼠标单击
                    var selectorId = this.$element.attr('data-is');
                    if (selectorId && this.variable.wrapId === selectorId) {
                        this.variable.$boxWrap = $('#' + selectorId);
                        if (this.variable.$boxWrap.hasClass('hide') || (this.variable.$inputWrap && !this.variable.$inputWrap.hasClass('hide'))) {
                            this.selectorTabReset();
                        };
                        this.toggleHideWrap(2, false);
                    } else {
                        this.variable.$boxWrap = this.createContainer().appendTo('body');
                        this.containerEvent();
                        this.ulEvent(this.variable.$selectorWrap);
                        this.$element.attr('data-is', this.variable.wrapId);
                    };
                    _methods.stopPropagation(e);
                }, this))
                .on('keyup.is', $.proxy(function(e) { //键盘按键
                    _methods.stopPropagation(e);

                    if (this.variable.$boxWrap && !this.variable.$boxWrap.hasClass('hide')) {
                        if (this.variable.$inputWrap && !this.variable.$inputWrap.hasClass('hide') && this.variable.$inputWrap.find('.empty').length == 0 && !this.KeyboardEvent(e)) {
                            return;
                        };
                        var value = this.$element.val().trim();
                        if (value) {
                            var $inputWrap;
                            $inputWrap = this.createInputWrap(value);
                            if ($inputWrap) {
                                this.variable.$boxWrap.append($inputWrap);
                            };
                            this.toggleHideWrap(2, true); //设置inputWrap显示
                            this.ulEvent(this.variable.$inputWrap); //绑定Li事件
                            this.paginationEvent(this.variable.$inputWrap);
                        };
                    };

                }, this))
                .on('focus.is', $.proxy(function(e) { //获取焦点
                    this.$element.select();
                    if (this.$element.val().trim() === this.options.defaultValue) this.$element.val('');
                }, this))
                .on('blur.is', function(e) { //失去焦点

                });
        },
        KeyboardEvent: function(e) {
            var keycode = e.keyCode,
                lis = this.variable.$inputWrap.find('li'),
                len = lis.length,
                result = false;
            switch (keycode) {
                case 40: //向下箭头↓
                    this.variable.count++;
                    if (this.variable.count > len - 1) this.variable.count = 0;
                    for (var i = 0; i < len; i++) {
                        $(lis[i]).removeClass('on');
                    }
                    $(lis[this.variable.count]).addClass('on');
                    break;
                case 38: //向上箭头↑
                    this.variable.count--;
                    if (this.variable.count < 0) this.variable.count = len - 1;
                    for (i = 0; i < len; i++) {
                        $(lis[i]).removeClass('on');
                    }
                    $(lis[this.variable.count]).addClass('on');
                    break;
                case 13: // enter键
                    this.$element.val(_variable.regExChiese.exec(lis[this.variable.count].innerHTML)[0]);
                    this.variable.$inputWrap.addClass('hide');
                    break;
                default:
                    result = true;
                    break;
            }
            return result;
        },
        selectorTabReset: function() {
            var that = this;
            if (this.variable.$tabWrap && this.options.isTab) {
                var $navTab = this.variable.$tabWrap.find('.is-nav-tabs');
                var tabShow = function($navTabs, isShow) {
                    $.map($navTabs, function(elem, index) {
                        var id = $(elem).attr('data-tab');
                        if (isShow) {
                            $(elem).addClass('active');
                            that.variable.pagination.pageCount = that.variable.$tabWrap.find('#' + id).removeClass('hide').find('[data-page]').length;
                        } else {
                            $(elem).removeClass('active');
                            that.variable.$tabWrap.find('#' + id).addClass('hide');
                        };
                    });
                };
                var show = function($showData) {
                    tabShow($navTab.children('li'), false);
                    tabShow($showData, true);
                };

                show($navTab.children('li:first'));
                if (this.options.isPaginator) {
                    this.paginationEvent(this.variable.$selectorWrap);
                };
                $navTab.children('li').off('click.is.tab');
                var $tabLi = $navTab.children('li').on('click.is.tab', function(e) {
                    _methods.stopPropagation(e);
                    show($(this));
                    if (that.options.isPaginator) {
                        that.paginationEvent(that.variable.$selectorWrap);
                    };
                });
                $tabLi.css('width', (1 / $tabLi.length * 100).toString() + '%');
            };
        },
        containerEvent: function() {
            if (this.variable.$boxWrap) {
                var that = this;
                this.variable.$boxWrap.on('click.is.container', function(e) {
                    _methods.stopPropagation(e);
                });

                $(document).on('click.is-' + this.variable.wrapId, function(e) {
                    that.closed();
                });
                this.selectorTabReset();

            };
        },
        paginationEvent: function($elem) {
            var that = this,
                $pageWrap;
            if ($elem && !$elem.hasClass('hide')) {

                $pageWrap = $elem.find('[data-wrap]:not(.hide)');
                this.variable.pagination.currentPage = -1;
                if (this.pagination(0, $pageWrap)) {
                    $elem.find('a[name="' + this.variable.wrapId + '-pageInstruction"]').html('1\\' + this.variable.pagination.pageCount.toString());
                };

                /*这里由于多次绑定，为了避免重复触发，需在再次绑定之时，解绑。*/
                $elem.find('a[name="' + this.variable.wrapId + '-pageBackward"]').off('click.is.page');
                $elem.find('a[name="' + this.variable.wrapId + '-pageForward"]').off('click.is.page');
                $elem.find('a[name="' + this.variable.wrapId + '-pageBackward"]').on('click.is.page', function(e) {
                    $pageWrap = $elem.find('[data-wrap]:not(.hide)');
                    if (that.pagination(that.variable.pagination.currentPage - 1, $pageWrap)) {
                        $elem.find('a[name="' + that.variable.wrapId + '-pageInstruction"]').html((that.variable.pagination.currentPage + 1).toString() + '\\' + that.variable.pagination.pageCount.toString());
                    };
                });
                $elem.find('a[name="' + this.variable.wrapId + '-pageForward"]').bind('click.is.page', function(e) {
                    $pageWrap = $elem.find('[data-wrap]:not(.hide)');
                    if (that.pagination(that.variable.pagination.currentPage + 1, $pageWrap)) {
                        $elem.find('a[name="' + that.variable.wrapId + '-pageInstruction"]').html((that.variable.pagination.currentPage + 1).toString() + '\\' + that.variable.pagination.pageCount.toString());
                    };
                });
            };
        },
        ulEvent: function($elem) {
            var that = this;
            if ($elem && !$elem.hasClass('hide')) {
                $elem.find('li.is-cell')
                    .on('click.is.ul', function(e) {
                        that.$element.val(_variable.regExChiese.exec(this.innerHTML)[0]);
                        that.toggleHideWrap(1, true);
                    })
                    .on('mouseover.is.ul', function(e) {
                        $(this).addClass('on');
                    })
                    .on('mouseout.is.ul', function(e) {
                        $(this).removeClass('on');
                    });
            };
        },
        unbind: function() { //取消绑定
            this.$element.off('.is');
            $(document).off('.is-' + this.variable.wrapId);
        },
        destroy: function() {
            this.unbind();
            this.variable.$boxWrap.remove();
            this.$element.attr('data-is', '');
        },
        closed: function() {
            this.toggleHideWrap(1, true);
        }
    };


    /*私有参数*/
    var _variable = {
        regEx: /^([\u4E00-\u9FA5\uf900-\ufa2d]+)\|(\w+)\|(\w)\w*$/i,
        regExChiese: /([\u4E00-\u9FA5\uf900-\ufa2d]+)/
    };

    /*共有方法*/
    var _methods = {
        getPos: function($node) { //获取元素位置
            var node = $node[0]; //jquery对象与dom对象的转换
            var scrollx = document.documentElement.scrollLeft || document.body.scrollLeft,
                scrollt = document.documentElement.scrollTop || document.body.scrollTop;
            var pos = node.getBoundingClientRect();
            return {
                top: pos.top + scrollt,
                right: pos.right + scrollx,
                bottom: pos.bottom + scrollt,
                left: pos.left + scrollx
            };
        },
        stopPropagation: function(e) { //阻止事件冒泡
            if (e.stopPropagation)
                e.stopPropagation();
            else
                e.cancelBubble = true;
        },
        sortPlaceData: function(pData, isSort) { //将placeData按字母顺序排序
            var result = [],
                match = [];

            for (var i = 0, n = pData.length; i < n; i++) {
                match = _variable.regEx.exec(pData[i]);
                result.push(match);
            };
            if (isSort) {
                result.sort(function(a, b) {
                    var s1 = [a[2], b[2]],
                        s2 = [a[2], b[2]];
                    s2.sort();
                    return s2[0] == s1[0] ? -1 : 1;
                });
            };

            return result;
        }
    };

    var old = $.fn.inputselector;
    $.fn.inputselector = function(option) {
        return this.each(function() {
            var $this = $(this),
                ui = $this.data("inputselector"); //向元素获数据
            if (!ui) {
                if (typeof option === 'object' || !option) {
                    ui = new Inputselector(this, option);
                    /*缓存插件*/
                    $this.data("inputselector", ui); //向元素附加数据
                } else {
                    $.error('inputselector组件尚未被初始化，初始化需传入相应的参数！');
                };
            };

            if (typeof option === "string" && typeof ui[option] == "function") {
                /*执行插件的方法*/
                ui[option].apply(ui, Array.prototype.slice.call(ui.options, 1));
            }
        });
    };

    /*暴露类名，可以用这个插件做自定义扩展*/
    $.fn.inputselector.Constructor = Inputselector;

    /*无冲突处理*/
    $.fn.inputselector.noConflict = function() {
        $.fn.inputselector = old;
        return this;
    };

}));

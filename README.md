# 选择输入组件 jquery.inputselector.js
inputselector组件，可以为普通的输入框添加选择输入功能。该组件功能包括两大部分：选择输入(selector)功能和输入选择(input)功能。前者当你单击输入框时，会弹出一个下拉面板，你可以从面板上选择相应内容，进而将内容输入到input标签中；后者表示当你在input标签输入相应汉字或拼音时，会自动匹配已有项，让你选择输入。该组件主要用于地点的选择。

##参数介绍

|名称|    类型| 默认值|    描述|
|----|-----|-----|-----|
|data   |Array| ['京\|jing\|j','津\|jin\|j','沪\|hu\|h','渝\|yu\|y',...]|需要进行绑定的数据(界面上将按字母顺序显示)|
|title| string  |'支持拼音输入'   |控件标题(为'空',则不显示数据说明)|
|hotDataTitle|  string| '热门'|   热点数据显示的标题(为'空',则不显示热点数据标题)|
|dataTitle| string| ''| 不分类时的数据标题|
|hotDataCount|  int|3|  热点数据的个数|
|defaultValue|  string| '京'|    input默认值|
|contentWidth|  string(CSS宽度值)| '310px'|    content框的宽度|
|contentHeight| string(CSS高度值)| 无   |content框的高度，默认值表示高度自适应；如果指定高度，将可能出现滚动条|
|isTab| boolean|    true|   是否是tab形式显示数据|
|isClassification|  boolean |true|  是否对数据进行分类|
|isPaginator|   boolean|    true|   是否进行分页。如果isTab和isClassfication同时为true,selectWrap(选择输入)实现分页；如果只有isPaginator为true,则只有inputWrap(输入选择)分页|
|paginatorRowCount| int |7| 多少行为一页|
|cellClass| string(CSS样式名称) |'is-tab-cell'| 自定义单条数据的样式|
|calculateDataCount|    function|   function() {return parseInt(310 / 45) * this.paginatorRowCount;}|   计算SelectorWrap时每一页的数据条数|
|wrapId |string|    无|  为selector外包框指定id。如果该参数为空，组件内部将根据宿主标签id自动生成一个id。|

##定义和用法

 - 使用本组件之前，需引入其依赖库：jquery.js、jquery.inputselector.css。
 - 理论上，拥有value属性的HTML标签都可以作为该组件的宿主标签，但建议最好使用input标签。下面是本组件的初始化方法：

```javascript
<input type="text" class="cityinput" id="city-select" value="" >
<script type="text/javascript">
$('#citySelect').inputselector({
    data:['京|jing|j','津|jin|j','沪|hu|h','渝|yu|y'],  //该参数是必须的，不然就没数据展示出来了
    isTab:false,  
    isClassification:false,
    dataTitle:'省份简称',  //当禁止数据分来时，可以设置数据标题，可以是内容看上去更规范。
    title:null,  //把插件标题设置为空，当然你也可以设置一些插件的说明性文字。
    isPaginator:false  //禁止分页
});
</script>
```

 - 合理设置自己要显示内容的标题。

```javascript
$('#city-select').inputselector({
    title:'组件说明标题',   //该参数若不为null或'',输入选择功能中也将出现相应说明
    dataTitle:'不分类时数据显示的标题',  //若isClassification设置为true，该参数将被忽略;dataTitle若为null，则不显示data标题。
    hotDataTitle:'重点地区',  //设置热点数据标题
    hotPlaceCount:2  //hotPlaceCount若为0，则不显示hotplace内容，同时hotDataTitle参数也将被忽略。
});
```

 - tab选项卡的前提是需要对数据进行分类(isClassification参数为true)；选择输入状态下，数据分页显示的前提是需要进行tab显示(isTab为true)。

```javascript
$('#city-select').inputselector({
    data:['京|jing|j','津|jin|j','沪|hu|h','渝|yu|y'],
    isClassification:true,
    isTab:true,   //前提是isClassification设置为true
    isPaginator:true   //上面两个参数为true,选择输入状态下才会分页
});
```

 - 对于分页时，每一页数据量的设置需要注意：1)在输入选择操作时，设置paginatorRowCount参数可以指定每一页有多少行;2)calculateDataCount方法返回值可以指定在选择输入状态下，每一页显示数据的个数。

```javacript
$('#city-select').inputselector({
    paginatorRowCount:10,  //设置每一页有10行数据，这样就决定了在输入选择状态下：10行/页。
    calculateDataCount:function(){
        return this.paginatorRowCount*5;  //单页50条数据。
    }
});
```

 - 利用cellClass参数你也可以指定自己的单条数据的显示样式。如果你要指定cellClass参数，那么单条数据的所有样式你都得重写。所以除非特殊情况，一般建议不设置该参数。
 - 你也可以调用如下方法执行相关处理。

```javascript
 /*假定inputselector已初始化*/

$('#city-select').inputselector('destroy');  //移除已初始化的组件
$('#city-select').inputselector('close');    //关闭正在使用的组件(这里的关闭只不过是暂时隐藏组件).
```
 

 
 
 
 
 

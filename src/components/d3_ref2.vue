<template>

</template>

<script>
    //界面位置待调整
    //大概只能在d3v4下跑，有force，拖完后变红固定，双击恢复，滚轮不可zoom（可以按ctrl后再滚轮，页面自带）
    //可读json文件
    import * as d3 from 'd3'

    export default {
        name: "d3_ref2",
        mounted() {
            console.log("d3_ref2 loaded!")
            var w = 1280,
                h = 800,
                r = 30,
                //colors = d3.scaleOrdinal(d3.schemeCategory20c);
                colors = d3.scaleOrdinal().domain(["species","subspecies","organ"]).range(["#FC9D9A","#F9CDAD","#B8F1ED"]);

            var force = d3.forceSimulation()
                .velocityDecay(0.2)
                .alphaDecay(0)
                .force("charge", d3.forceManyBody().strength(-200)) //负值表示设置为互斥力
                .force("x", d3.forceX(w / 2).strength(0.02))
                .force("y", d3.forceY(h / 2).strength(0.02))
            ;

            var svg = d3.select("body").append("svg")
                .attr("width", w)
                .attr("height", h);


            d3.json("/data_d3ref2/graph.json", function (data) {
                console.log("json loading...")

                var nodes = data.nodes;
                var links = data.links;

                force.nodes(nodes); // <-D
                force.force("link", d3.forceLink(links).strength(1).distance(150));

                //设置箭头
                var arrowsize=8
                svg.append('defs').append('marker')
                    .attr('id','arrowhead')
                    .attr('viewBox','-0 -5 10 10')
                    .attr('refX',r+15)
                    .attr('refY',0)
                    .attr('orient','auto')
                    .attr('markerWidth',arrowsize)
                    .attr('markerHeight',arrowsize)
                    .attr('xoverflow','visible')
                    .append('svg:path')
                    .attr('d', 'M 0,-5 L 10 ,0 L 0,5')
                    .attr('fill', '#999')
                    .style('stroke','none');
                //设置连线，加上箭头
                var link = svg.selectAll(".link")
                    .data(links)
                    .enter()
                    .append("line")
                    .attr("class", "link")
                    .attr('marker-end','url(#arrowhead)')
                //连线上加title
                link.append("title")
                    .text(function (d) {return d.rel;});

                //利用path加上text
                var lineFunction=d3.line()  //用d3.line函数将links中的source和target的xy值自动生成path的"d"参数需要的形式
                    .x(function (d){return d.source.x?d.source.x:d.target.x})
                    .y(function (d){return d.source.y?d.source.y:d.target.y});
                var edgepaths = svg.selectAll(".edgepath")
                    .data(links)
                    .enter()
                    .append('path')
                    .attr('class', 'edgepath')
                    .attr('id', function (d, i) {return 'edgepath' + i}) //每个path元素加上id，以便与下面的textpath绑定
                    .attr("d",function (d) {return lineFunction(d)}) //将lineFunction自动生成的"M x1 y1 L x2 y2"的形式传给d参数
                    .attr("stroke", "grey")
                    .attr("stroke-width", 2)
                    .attr("opacity", 0.5)
                    .style("pointer-events", "none");

                var edgelabels = svg.selectAll(".edgelabel")
                    .data(links)
                    .enter()
                    .append('text')
                    .style("pointer-events", "none")
                    .attr('class', 'edgelabel')
                    .attr('id', function (d, i) {return 'edgelabel' + i})
                    .attr('font-size', 10)
                    .attr('fill', 'black');

                edgelabels.append('textPath')
                    .attr('xlink:href', function (d, i) {return '#edgepath' + i})
                    .style("text-anchor", "middle")
                    .style("pointer-events", "none")
                    .attr("startOffset", "50%")
                    .text(function (d) {return d.rel});




                var tooltip = d3.select("body").append("div").attr("id", "tooltip").style("opacity", 0);//悬浮窗

                var nodeElements = svg.selectAll("circle.node")
                    .data(nodes)
                    .enter().append("circle")
                    .attr("r", function(d){if (d.label=="organ") {return 2*r/3}
                    else {return r}}) //如果是器官节点，半径取2*r/3
                    .style("fill", function(d) {
                        return colors(d.label);
                    })
                    .style("stroke", "#000")
                    .call(d3.drag()
                        .on("start", dragStarted)
                        .on("drag", dragged)
                        .on("end", dragEnded))
                    .on("dblclick",releaseNode)
                    .on("mouseover",function(d){
                        d3.select(this).style('stroke',"#999").style('stroke-width',5); //鼠标放在器官节点上，边框加粗
                        if (d.properties.原文||d.properties.拉丁学名) {  //如果有原文或拉丁学名，显示在悬浮框tooltip中
                            tooltip.transition().duration(200).style("opacity", 0.9);
                            tooltip.html(d.properties.原文?d.properties.原文:d.properties.拉丁学名).style("left", (d3.event.pageX) + "px").style("top", (d3.event.pageY - 28) + "px");
                        }
                    })
                    .on("mouseout",function(d){
                        d3.select(this).style('stroke',"black").style('stroke-width',1); //鼠标离开器官节点，边框复原，悬浮框隐藏
                        tooltip.transition().duration(500).style("opacity", 0);
                    })

                var textScale=d3.scaleLinear().domain([1,6]).range([16,10]); //根据字符串长度自动插值字号大小

                var text=svg.selectAll("text.nodetext").data(force.nodes())
                    .enter().append("text")
                    .attr("class","nodetext")
                    .attr("color", "black")
                    .attr("text-anchor","middle")
                    .style("font-size",function (d){
                        if (d.name.length<7){return textScale(d.name.length);} //如果字符串长度小于7，按插值计算字号大小
                        else {return 10;} //如果大于7，字号取最小值10
                    })
                    .text(function(d){
                        return d.name;});



                force.on("tick", function(e) {
                    //linkpath.attr("d", function(d) { return "M "+boundX(d.source.x)+" "+boundY(d.source.y)+" L "+boundX(d.target.x)+" "+boundY(d.target.y); });

                    link.attr("x1", function(d) { return boundX(d.source.x); })
                        .attr("y1", function(d) { return boundY(d.source.y); })
                        .attr("x2", function(d) { return boundX(d.target.x); })
                        .attr("y2", function(d) { return boundY(d.target.y); });

                    nodeElements.attr("cx", function(d) { return boundX(d.x); })
                        .attr("cy", function(d) { return boundY(d.y); });

                    text.attr("dx", function(d) { return boundX(d.x); })
                        .attr("dy", function(d) { return boundY(d.y); });

                    edgepaths.attr('d', function (d) {
                        return 'M ' + boundX(d.source.x) + ' ' + boundY(d.source.y) + ' L ' + boundX(d.target.x) + ' ' + boundY(d.target.y);
                    });

                    edgelabels.attr('transform', function (d) {
                        if (boundX(d.target.x) < boundX(d.source.x)) {
                            var bbox = this.getBBox();

                            var rx = bbox.x + bbox.width / 2;
                            var ry = bbox.y + bbox.height / 2;
                            return 'rotate(180 ' + rx + ' ' + ry + ')';
                        }
                        else {
                            return 'rotate(0)';
                        }
                    })
                });
            });

            //节点拖拽并固定，固定后节点变红色
            function dragStarted(d) {
                d.fx = boundX(d.x);
                d.fy = boundY(d.y);
            }

            function dragged(d) {
                d.fx = boundX(d3.event.x);
                d.fy = boundY(d3.event.y);
            }

            function dragEnded(d) {
                d.fx = boundX(d.x);
                d.fy = boundY(d.y);
                d3.select(this).style('fill',"#F00");
            }
            //双击解除节点固定，并恢复颜色
            function releaseNode(d) {
                d.fx = null;
                d.fy = null;
                d3.select(this).style('fill',colors(d.label));
            }
            //确保节点不会被拖拽到svg画布之外
            function boundX(x) {
                return x>(w-r)?(w-r):(x>r?x:r);
            }

            function boundY(y) {
                return y>(h-r)?(h-r):(y>r?y:r);
            }

    //d3.json("static/data/result.json", function (data) {console.log(JSON.stringify(data, null, 4));}) //将Neo4j导出的json文件输出到控制台，便于查看
        }
    }
</script>



<style scoped>
    /* banner样式 */
    .banner-change{margin:0 auto;overflow:hidden;position:relative;}
    .banner-change .hd{height:16px;overflow:hidden;margin:0 auto;position:absolute;bottom:4px;left:46.5%;z-index:1;}
    .banner-change .hd ul{overflow:hidden;zoom:1;float:left;}
    .banner-change .hd ul li{float:left;margin-right:2px;width:12px;border-radius: 12px;height:12px;background:#d4d4d4;cursor:pointer;margin-left:5px;margin-right:5px;}
    .banner-change .hd ul li.on{background:#3caeed;color:#dc2c2c;}
    .banner1{position:relative;}
    .banner1 ul img{width:100%;display:block;}

    /* common样式 */
    body,div,dl,dt,dd,ul,ol,li,h1,h2,h3,h4,h5,h6,pre,code,form,fieldset,legend,input,button,textarea,p,blockquote,th,td { margin:0; padding:0; }
    img {border: none;}
    body {
        font-family: "宋体",sans-serif;
        background-color: white;
    }
    ol,ul,li {list-style:none;}
    a{text-decoration:none;color:#595757;}
    p{
        color: #000000;
    }
    a:hover {text-decoration:underline;}
    table { border-collapse:collapse; }
    html {overflow-y: scroll;}
    .clr:after {content: "."; display: block; height:0; clear:both; visibility: hidden;}
    .clr { *zoom:1; }
    /* header样式 */
    .header{margin:0 auto;width:1280px;}
    .header_t{width:1002px;height:84px;padding-top:24px;background:url(/files_d3ref2/header_01.jpg) repeat-y;}
    .logo{float:left;margin-left: 44px;}
    .logo img{
        width: 92px;
        height: 60px;
        border: none;
    }
    .header_s{float:left;padding-top:14px;line-height:28px;margin-left:4px;}
    .header_s p{
        font-family: "黑体";
        font-size: 18px;
        color: #000;
    }
    .header_r{float:right;margin-right:6px;margin-top:10px;width:144px;height:18px;}
    .header-r-t {
        text-align: right;
    }
    .header-r-t a {
        margin-right: 5px;
        font-family: "Arail";
        font-size: 12px;
        display: inline-block;
        width: 56px;
        height: 18px;
        color: #A9A9A9;
        background-color: #fff;
        line-height: 18px;
        text-align: center;
    }
    .header-r-t a:hover {
        color: #ff8400;
        text-decoration: none;

    }
    .header-r-b {
        margin-top: 6px;
    }

    .nav{width:1280px;height:40px;background:url(/files_d3ref2/header_03.jpg) repeat-y;}
    .nav ul{}
    .nav ul li{width: 124px; height: 32px; background: url(/files_d3ref2/header_04.jpg) repeat-x;text-align:center;float:left;margin-right:1px;border-radius:2px; border-top: 1px solid #bcbcbc;}
    .nav ul li a{display: inline-block;width: 94px;height: 30px;}
    #nav .nav_home {width: 126px;}
    .nav_home img{
        width: 18px;
        height: 18px;
        /* vertical-align: middle; */
        margin-top: 5px;
    }
    .nav_home:hover{}
    .nav_home~li:hover{background:#2f4f30;text-align:center;border-top: 1px solid #2F4F30;}
    .nav_home~li:hover a{color:#fff;text-decoration:none;}
    .nav ul li a {
        font-size:14px;
        line-height: 30px;
    }
    .nav ul .nav_on{background:#2f4f30; border-top: 1px solid #2F4F30;}
    .nav ul .nav_on a{color:#fff;}
    .main{width:1280px;margin:0 auto;padding-bottom:8px;}
    .main_t{height:28px;line-height:28px;margin-bottom:8px;}
    .main_t a{color:#fff;font-size:13px;margin-left:12px;}
    .main_t a:hover{color:#ff8400;}
    .main_t span{color:#fff;font-size:13px;margin-left:14px;}
    .list{width:284px;margin-left:14px;font-size:12px;float:left;}

    .list{width:284px;margin-left:14px;font-size:12px;float:left;}

    .list_t li{line-height:28px;background-color:#fff;}

    .list_t li a{font-family: "黑体";text-decoration: none;display:block;padding-left:44px;margin-bottom:6px; background-repeat:no-repeat;background-position:24px center;color: #595750; font-size: 13px;}
    .list_t li a:hover{ background-repeat:no-repeat;background-position:24px center;}

    .list_t .li_active a,.list_t li a:hover{background-color: #2F4F30;color: #fff;text-decoration: none;}
    .list_t li a:hover{color: #ff8400;}


    .list_t li:last-child{margin-bottom:16px;}
    .list_m{background-color:#fff;padding:14px 6px;margin-bottom:36px;}
    .list_m_t{color:#1d5638;font-size:14px;margin-bottom:8px;font-family: "黑体";}
    .list_m_t span{font-size:12px;font-family: "Arail";}
    .list_m p{line-height:20px;margin-bottom:16px;}
    .list_m a:hover{color:#ff8400; text-decoration: none;}
    .list_b{width:284px;}
    .list_b ul{margin:0 auto;width:206px;}
    .list_b ul li{width:206px;height:56px;text-align:center;margin-bottom:12px;background-color:#dcdddd;border-radius:6px;line-height:56px;overflow: hidden;}
    .list_b ul li img{width:206px;height:56px;}

    .main_r{float:left;width: 672px; margin-left:12px;}
    .main_img{ height:158px; overflow: hidden;}
    .main_img img{width: 672px;height: 158px;}
    .main_img span{position: relative;left: 538px;bottom: 28px;color: #FFF;letter-spacing: 8px;font-size: 18px;font-family:"黑体";}
    .main_r_c{width:592px;padding:40px;background-color:#fff;font-size:14px;line-height:22px;min-height:610px; text-align: justify;}
    .main_r_c h3{text-align:center;font-size:16px;margin-bottom:12px;font-family: "黑体";}
    /*首页*/
    .banner{width:1002px;margin:0 auto;}
    .banner img{width:100%;}
    .hlist{width:284px;float:left;margin-top:22px;margin-left:14px;}
    .list_f_t{
        background: #03F;
        height: 30px;
        color: #fff;
        line-height: 30px;
        text-indent: 6px;
        font-size: 13px;
        font-family: "黑体";
    }
    .list_f_t span{font-size:11px;padding-left:4px;vertical-align:middle;font-family: "Arail";}
    .list_f_c{height:260px;}
    .list_f_c  , .list_s_c{
        background-color: #fff;
        padding: 12px;
        line-height: 22px;
        font-size: 10px;
        margin-top: 6px;
        margin-bottom: 8px;
        height: 180px;
    }
    .list_f_c a:hover{color:#ff8400;}
    .list_s_c a:hover{color:#ff8400;}
    .list_s_c{height:194px;}
    .list_s_c ul li{background-position:0 9px;text-indent:12px;line-height:22px; font-size: 12px;}
    .list_s_c ul li:hover{background-position:0 9px;color:#ff8400;}
    .list_f_c a{ font-size: 12px;}
    .list_s_c a{ font-size: 12px;}
    .hmain_r{width:672px;float:left;margin-top:22px;margin-left:14px;}
    .hmain_r_t{
        width: 672px;
        height: 30px;
        font-size: 13px;
        line-height: 30px;
        background: #03F;
        color: #fff;
        text-indent: 10px;
        font-family: "黑体";
    }
    .hmain_r_t span{font-size:11px;padding-left:4px;vertical-align:middle; font-family: "Arail";}
    .hmain_r_c{
        height: 180px;
        margin-top: 6px;
        background-color: #fff;
        padding-top: 12px;
        padding-bottom: 12px;
    }
    .hmain_r_c ul { margin-left: 12px;}
    .hmain_r_c ul li{width:198px;display:inline-block;margin:10px 6px;}
    .hmain_r_c ul li img{
        width: 145px;
        height: 125px;
    }
    .hmain_r_c ul li p{text-align:left;height:40px;overflow:hidden;margin-top: 10px;}
    .hmain_r_c ul li p a{
        color: #2b5335;
        font-size: 12px;
        font-family: "黑体";
    }
    .hmain_r_c ul li p a:hover{
        color: #ff8400;
    }
    .company{margin-top:10px;overflow:hidden;}
    .company ul li{float:left;width:162px;margin-right:8px;}
    .company_img{width:162px;height:44px;text-align:center;margin-bottom:8px;background-color:#dcdddd;border-radius:6px;line-height:54px;overflow:hidden;}
    .company_img img{width:162px;height:44px;}

    /*other*/
    .rmain_r_c{min-height:578px;}
    .link{width:450px;margin:0 auto;text-align:center;}
    .link a{display:inline-block;margin:0 10px;}
    .link img{width:66px;height:44px;}
    #main_page{text-align:center;}
    #main_page a{display:inline-block;margin-right:4px;}
    #main_page a:hover{color:#ff8400;}
    #main_page span{display:inline-block;margin-right:4px;}
    .page_current{color:#ff8400;}
    .item_l{float:left;margin-right:32px;margin-bottom:32px;}
    .item_l img{width: 198px; height: 134px;}
    .item_r{position: relative; float:left;width:340px;font-size:10px;line-height:16px;height:134px;}
    .item-r-c { position: absolute; bottom: 0px; }
    .item_r a:hover{color:#ff8400; text-decoration: none;}
    .item_r a:hover span{color: #ff8400;}
    .pmain_r_cd{min-height:658px;}
    .main_r_cd{margin-top:16px;}
    .main_r_csl{float:left;margin-right:28px;}
    .main_r_csl img{width:188px;height:126px;}
    .main_r_csr{float:left;width:320px;font-size:10px;line-height:16px;padding-top:36px;height:88px;overflow:hidden;}
    .nmain_r_c{width:592px;padding:40px;background-color:#fff;font-size:12px;line-height:22px;min-height:686px;}
    .nmain_r_c ul{min-height:686px;}
    .nmain_r_c ul li{background-position:0 center;text-indent:12px;line-height:22px;}
    .nmain_r_c ul li:hover{background-position:0 center;color:#ff8400;}
    .nmain_r_c ul a:hover {
        color: #ff8400;

    }
    .sort{text-align:center;}
    .main_r_h{font-weight:500;letter-spacing:2px;margin-bottom:0;}
    .emain_r_c{width:592px;padding:40px;background-color:#fff;font-size:12px;line-height:22px;min-height:686px;}
    .emain_r_c ul{min-height:624px;}
    .emain_r_c h3{text-align:center;font-size:16px;margin-bottom:12px;font-family:"黑体";}
    .emain_r_c ul li{margin-top:16px;}
    .emain_r_c ul li a:hover{color:#ff8400;}
    .emain_r_c ul li span{display: inline-block; width: 128px; float:left;margin-right:14px;text-align: center;}
    .main_r_ct{float: left;width: 400px;}
    .main-c-pul{min-height: 686px;}
    .main-c-pul li{background-position:0 center;text-indent:12px;line-height:22px;}
    .main-c-pul li:hover{background-position:0 center;color:#ff8400;}
    /*footer 样式*/
    .footer{width:1002px;height:28px;margin:0 auto;line-height:28px;font-size:12px;color:#fff;}
    .footer p{text-align:center;color:#fff;}

    .nmain-r-ct {
        margin-bottom: 12px;
        font-size: 16px;
        text-align: center;
        font-family: "黑体";
    }
    .nmian-r-cts {
        margin-bottom: 12px;
        font-size: 12px;
        text-align: center;
        font-family: "宋体";
        color: #595757;
    }
    .list-f-cc {
        height: 160px;
        overflow: hidden;
    }

    .imore:hover {
        text-decoration: none;
    }
    .list_s_c ul {
        min-height: 168px;
    }

    /* style样式 */
    body,div,ul,ol,li,h1,h2,h3,h4,h5,h6,pre,code,form,fieldset,legend,input,button,textarea,p,blockquote,th,td { margin:0; padding:0; }
    body {
        font-family: "helvetica";
    }
    button {
        margin: 0 7px 0 0;
        background-color: #f5f5f5;
        border: 1px solid #dedede;
        border-top: 1px solid #eee;
        border-left: 1px solid #eee;
        font-size: 12px;
        line-height: 130%;
        text-decoration: none;
        font-weight: bold;
        color: #565656;
        cursor: pointer;
    }
    a {
        text-decoration: none;
        color: #595757;
    }
    a:hover {
        text-decoration:underline;
    }
    ol,ul,li {
        list-style:none;
    }
    #tooltip {
        position: absolute;
        text-align: center;
        width: 400px;
        height: 28px;
        padding: 2px;
        font: 12px sans-serif;
        background: lightsteelblue;
        border: 0px;
        border-radius: 8px;
        pointer-events: none;
    }
    .header{
        margin:0 auto;
        width:1280px;
    }
    .header_t{
        width:1002px;
        height:84px;
        padding-top:24px;
    }
    .header_s{
        float:left;
        padding-top:14px;
        line-height:28px;
        margin-left:4px;
    }
    .header_r{
        float:right;
        margin-right:6px;
        margin-top:10px;
        width:144px;
        height:18px;
    }
    .header-r-b{
        margin-top: 6px;
    }
    .nav{
        width:1280px;
        height:40px;
    }
    .nav ul li{
        width: 124px;
        height: 32px;
        text-align:center;
        float:left;
        margin-right:1px;
        border-radius:2px;
        border-top: 1px solid #bcbcbc;
    }
    .nav ul li a {
        display: inline-block;
        width: 94px;
        height: 30px;
    }
    #nav .nav_home {
        width: 126px;
    }
    .nav_home img{
        width: 18px;
        height: 18px;
        margin-top: 5px;
    }
    .nav_home:hover{}
    .nav_home li:hover{
        background:#2f4f30;
        text-align:center;
        border-top: 1px solid #2F4F30;
    }
    .nav_home li:hover a{
        color:#fff;
        text-decoration:none;
    }
    .nav ul li a {
        font-size: 14px;
        line-height: 30px;
    }
    .nav ul .nav_on{
        background:#2f4f30;
        border-top: 1px solid #2F4F30;
    }
    .nav ul .nav_on a{
        color:#fff;
    }
    .main{
        width:1280px;
        margin:0 auto;
        padding-bottom:8px;
    }



</style>

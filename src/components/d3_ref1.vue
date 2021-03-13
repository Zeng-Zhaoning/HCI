<template>
    <div class='knowledge-graph'>
        <div class="search-box">
            <div>
                <input type="text"
                       placeholder="请输入关键字搜索"
                       v-model="keywords"
                       @keyup.13="getData">
                <button @click="getData"></button>
            </div>
        </div>
        <div class="svg-box">
            <div class="tooltip-popper" v-show="tipsVisible" :style="tipsStyle">
                <div class="tooltip-content">
                    <div class="tooltip-arrow"></div>
                    <div class="tooltip-inner">{{tipsText}}</div>
                </div>
            </div>
            <div class="type-list">
                <span style="background-color: rgb(255, 216, 110);color: #000;"
                      @click="filterNode">
                    全部({{allNodes.length}})
                </span>
                <span v-for="(val, key) in typeList"
                      :style="{background: typeColor[key]}"
                      :key="key"
                      @click="filterNode(key)">
                    {{key }}({{val}})
                </span>
            </div>
        </div>
    </div>
</template>

<script>
    //大概只能在d3v4下跑, 有force，拖完后不固定，滚轮可zoom
    import * as d3 from 'd3'

    let svg, drag, simulation
    let nodeGroup, nodeTextGroup, linkGroup, linkTextGroup
    let links, linkText, node, nodeText
    const radius = 30
    const distance = 200
    const forceStrength = -200

    export default {
        name: 'd3_ref1',
        data () {
            return {
                allNodes: [],
                allEdges: [],

                currentNodes: [],
                currentEdges: [],

                colorStore: [],
                typeList: {},
                typeColor: [],

                tipsText: '',
                tipsStyle: {
                    top: 0,
                    left: 0
                },
                tipsVisible: false,

                keywords: ''
            }
        },
        created () {
            const color = [
                'rgb(104, 189, 246)',
                'rgb(109, 206, 158)',
                'rgb(255, 117, 110)',
                'rgb(222, 155, 249)',
                'rgb(251, 149, 175)',
                'rgb(165, 171, 182)'
            ]
            this.colorStore = [...color, ...d3.schemeCategory20]
        },
        mounted () {
            // 禁用右键菜单
            document.oncontextmenu = () => {
                event.returnValue = false
            }
            this.getData()
        },
        computed: {
            // 当前 nodes id集合
            currentNodesId () {
                let ids = {}
                this.currentNodes.forEach(val => {
                    ids[val.id] = true
                })
                return ids
            },

            // 当前 edges id集合
            currentEdgesId () {
                let ids = {}
                this.currentEdges.forEach(val => {
                    ids[val.index] = true
                })
                return ids
            }
        },
        methods: {
            test () {
                d3.json('/static_ref1/data/data1.json', (error, data) => {
                    if (error) {
                        return console.error(error)
                    }
                    const { nodes, edges } = data
                    if (nodes.length === 0 && edges.length === 0) {
                        layer('没有数据')
                    } else {
                        this.graphInit(nodes, edges)
                    }
                })
            },

            getData () {
                return this.test()
                let url = this.keywords === '' ? '/nodes' : `/node?key_word=${this.keywords}`
                d3.request(url)
                    .response(res => {
                        res = JSON.parse(res.responseText)
                        if (res.code === 0) {
                            let { nodes, edges } = res.data
                            if (nodes.length === 0 && edges.length === 0) {
                                layer('没有数据')
                            } else {
                                // edges 去重、去除错误数据
                                /* let obj = {}
                                let arr = []
                                edges.forEach(val => {
                                    if (val.source === null || val.target === null) {
                                        return
                                    }
                                    let key = val.source + '-' + val.target
                                    if (obj.hasOwnProperty(key)) {
                                        if (obj[key] === val.label) {
                                            // 两条线 完全重复
                                        } else {
                                            // 两条线 连接节点重复，label不同，将label整合在一起
                                            obj[key] += '/' + val.label
                                        }
                                    } else {
                                        obj[key] = val.label
                                        arr.push(val)
                                    }
                                })
                                edges = arr */
                                this.graphInit(nodes, edges)
                            }
                        } else {
                            layer(res.msg)
                        }
                    })
                    .get()
            },

            // 计算类型，分配颜色
            setTypeColor (nodes) {
                let list = {}
                let index = 0
                let typeList = {}
                let len = this.colorStore.length
                nodes.forEach(val => {
                    if (!list.hasOwnProperty(val.type)) {
                        typeList[val.type] = 1
                        list[val.type] = this.colorStore[index % len]
                        index++
                    } else {
                        typeList[val.type]++
                    }
                })
                this.typeList = typeList
                this.typeColor = list
            },

            // 缩放
            zoom () {
                const zoom = d3.zoom()
                    .scaleExtent([0.2, 5])
                    .on('zoom', zoomed)
                svg.call(zoom)

                function zoomed () {
                    const transform = d3.event.transform
                    const svgCss = 'translate(' + transform.x + ',' + transform.y + ') scale(' + transform.k + ')'
                    svg.selectAll('g').attr('transform', svgCss)
                }
            },

            // 画箭头
            drawingArrow () {
                let defs = svg.append('defs')
                let arrowMarker = defs.append('marker')
                    .attr('id', 'arrow')
                    .attr('markerUnits', 'strokeWidth')
                    .attr('markerWidth', '12')
                    .attr('markerHeight', '12')
                    .attr('viewBox', '0 0 12 12')
                    .attr('refX', '6')
                    .attr('refY', '6')
                    .attr('orient', 'auto')
                arrowMarker.append('path')
                    .attr('d', 'M2,2 L2,11 L10,6 L2,2')
                    .attr('fill', 'rgb(165, 171, 182)')
            },

            // 拖拽
            dragEvent () {
                drag = d3.drag() // 拖拽
                drag.on('start', dragStarted)
                    .on('drag', dragged)
                    .on('end', dragEnd)

                function dragStarted (d) {
                    if (!d3.event.active) {
                        simulation.alphaTarget(0.2).restart()
                    }
                    d.fx = d.x
                    d.fy = d.y
                }

                function dragged (d) {
                    d.fx = d3.event.x
                    d.fy = d3.event.y
                }

                function dragEnd (d) {
                    if (!d3.event.active) {
                        simulation.alphaTarget(0)
                    }
                    d.fx = null
                    d.fy = null
                }
            },

            // 事件
            graphEvent () {
                const that = this

                node
                    .on('mouseover', function (d) { hoverIn(d) })
                    .on('mouseout', function (d) { hoverOut(d) })
                    .on('click', d => {
                        this.keywords = d.content
                        this.searchMyNear(d)
                    })

                nodeText
                    .on('mouseover', function (d) { hoverIn(d) })
                    .on('mouseout', function (d) { hoverOut(d) })
                    .on('click', d => {
                        this.keywords = d.content
                        this.searchMyNear(d)
                    })
                /* .on('mouseup', function (d) {
                    if (d3.event.which === 3) {
                        let value = prompt("请输入需要修改的名称", d.content)
                        if (value !== null && value !== "") {
                            d3.select(this)
                                .attr('x', d.x - 30 + (60 - 17 * value.length) / 2)
                                .text(value)
                            d.content = value
                        }
                    }
                }) */
                linkText
                    .on('mouseover', function (d) { hoverIn(d, true) })
                    .on('mouseout', function (d) { hoverOut(d, true) })

                // 更新 提示窗 位置
                svg.on('mousemove', () => {
                    if (this.tipsVisible) {
                        this.tipsStyle = {
                            top: d3.event.pageY + 20 + 'px',
                            left: d3.event.pageX + 'px'
                        }
                    }
                })

                // 右键修改 连接线名称
                /* linkText.on('mouseup', function (d) {
                    if (d3.event.which === 3) {
                        let value = prompt("请输入需要修改的名称", d.label)
                        if (value !== null && value !== "") {
                            // 计算修改文字后的坐标
                            let textWidth = 0
                            try {
                                textWidth = value.length * 13
                            } catch (e) {}
                            const x = (d.source.x + d.target.x) / 2 - textWidth / 2
                            // 更新 文字和位置
                            d3.select(this)
                                .attr('x', x)
                                .text(value)
                            d.label = value
                        }
                    }
                }) */

                function hoverIn (d, link) {
                    let original = link ? d.label : d.content
                    if (d.showText !== original.toString()) {
                        that.tipsText = original
                        that.tipsVisible = true
                    }
                }

                function hoverOut (d, link) {
                    let original = link ? d.label : d.content
                    if (d.showText !== original.toString()) {
                        that.tipsVisible = false
                        that.tipsText = ''
                    }
                }
            },

            // 绘图 初始化
            graphInit (nodes, edges) {
                this.setTypeColor(nodes)
                // 记录数据
                this.allNodes = nodes
                this.allEdges = edges
                this.currentNodes = [...nodes]
                this.currentEdges = [...edges]

                const svgBox = d3.select('.svg-box')
                svgBox.select('svg').remove()
                svg = svgBox.append('svg')

                const width = window.innerWidth
                const height = window.innerHeight - 134
                const forceManyBody = d3.forceManyBody().strength(forceStrength)

                // 转换数据
                const forceLink = d3.forceLink(edges).distance(distance)
                simulation = d3.forceSimulation(nodes)
                    .force('charge', forceManyBody)
                    .force('link', forceLink)
                    .force('center', d3.forceCenter(width / 2, height / 2))

                this.dragEvent() // 拖拽
                this.drawingArrow() // 画箭头

                // 绘图，添加dom
                linkGroup = svg.append('g').attr('class', 'links')
                linkTextGroup = svg.append('g').attr('class', 'link-text')
                nodeGroup = svg.append('g').attr('class', 'nodes')
                nodeTextGroup = svg.append('g').attr('class', 'node-text')
                this.graphDraw(nodes, edges)
                simulation.on('tick', () => { this.updatePosition() }) // 每一个时间间隔之后就刷新一遍画面
            },

            // 更新位置
            updatePosition () {
                /*
                //限制结点的边界
                nodes.forEach(function(d){
                    d.x = d.x - radius < 0 ? radius : d.x ;
                    d.x = d.x + radius > width ? width - radius : d.x ;
                    d.y = d.y - radius < 0 ? radius : d.y ;
                    d.y = d.y + radius > height ? height - radius : d.y ;
                });
                */

                // 更新连接线的位置
                links
                    .attr('x1', d => { return d.source.x })
                    .attr('y1', d => { return d.source.y })
                    .attr('x2', d => { return countAxis(d, radius).x })
                    .attr('y2', d => { return countAxis(d, radius).y })

                // 更新连接线上文字的位置
                linkText
                    .attr('x', d => {
                        let textWidth = 0
                        try {
                            textWidth = d.showText.length * 10
                        } catch (e) {}

                        return (d.source.x + d.target.x) / 2 - textWidth / 2
                    })
                    .attr('y', d => {
                        return (d.source.y + d.target.y) / 2 + 4
                    })
                    .attr('transform', d => {
                        const x = (d.source.x + d.target.x) / 2
                        const y = (d.source.y + d.target.y) / 2
                        return `rotate(${countAxisRotate(d)}, ${x} ${y})`
                    })

                // 更新结点位置
                node
                    .attr('cx', d => {
                        return d.x
                    })
                    .attr('cy', d => {
                        return d.y
                    })

                // 更新结点上文字的位置
                nodeText
                    .attr('x', d => {
                        return d.x
                    })
                    .attr('y', d => {
                        return d.y
                    })
            },

            // 绘图
            graphDraw (nodes, edges) {
                const typeColor = this.typeColor

                // 画节点
                node = nodeGroup
                    .selectAll('circle')
                    .data(nodes)
                    .enter()
                    .append('circle')
                    .style('fill', d => { return typeColor[d.type] })
                    .style('stroke', d => { return d3.color(typeColor[d.type]).darker(0.4) })
                    .attr('r', radius)
                    .call(drag)

                // 画节点上文字
                nodeText = nodeTextGroup
                    .selectAll('text')
                    .data(nodes)
                    .enter()
                    .append('text')
                    .text(d => {
                        d.showText = occupyLength(d.content)
                        return d.showText
                    })
                    .call(drag)

                // 画连接线
                links = linkGroup
                    .selectAll('line')
                    .data(edges)
                    .enter()
                    .append('line')
                    .attr('marker-end', 'url(#arrow)')

                // 画连接线上文字
                linkText = linkTextGroup
                    .selectAll('text')
                    .data(edges)
                    .enter()
                    .append('text')
                    .text(d => {
                        d.showText = occupyLength(d.label, 16)
                        return d.showText
                    })

                this.zoom() // 缩放
                this.graphEvent() // 绑定事件
            },

            // 绘图更新
            graphUpdate (nodes, edges) {
                this.currentNodes = [...nodes]
                this.currentEdges = [...edges]
                const typeColor = this.typeColor

                // 画节点
                const updateNode = nodeGroup.selectAll('circle').data(nodes, d => { return d.id })
                updateNode
                    .style('fill', d => { return typeColor[d.type] })
                    .style('stroke', d => { return d3.color(typeColor[d.type]).darker(0.4) })
                updateNode.enter()
                    .append('circle')
                    .style('fill', d => { return typeColor[d.type] })
                    .style('stroke', d => { return d3.color(typeColor[d.type]).darker(0.4) })
                    .attr('r', 1e-6)
                    .transition()
                    .attr('r', radius)
                updateNode.exit()
                    .transition()
                    .attr('r', 1e-6)
                    .remove()
                node = nodeGroup.selectAll('circle')
                node.call(drag)

                // 画节点上文字
                const updateNodeText = nodeTextGroup.selectAll('text').data(nodes, d => { return d.id })
                updateNodeText.text(d => {
                    d.showText = occupyLength(d.content)
                    return d.showText
                })
                updateNodeText.enter()
                    .append('text')
                    .text(d => {
                        d.showText = occupyLength(d.content)
                        return d.showText
                    })
                updateNodeText.exit().remove()
                nodeText = nodeTextGroup.selectAll('text')
                nodeText.call(drag)

                // 画连接线
                const updateLinks = linkGroup.selectAll('line').data(edges, d => { return d.index })
                updateLinks.enter()
                    .append('line')
                    .attr('marker-end', 'url(#arrow)')
                updateLinks.exit().remove()
                links = linkGroup.selectAll('line')

                // 画连接线上文字
                const updateLinkText = linkTextGroup.selectAll('text').data(edges, d => { return d.index })
                updateLinks.text(d => {
                    d.showText = occupyLength(d.label, 16)
                    return d.label
                })
                updateLinkText.enter()
                    .append('text')
                    .text(d => {
                        d.showText = occupyLength(d.label, 16)
                        return d.label
                    })
                updateLinkText.exit().remove()
                linkText = linkTextGroup.selectAll('text')

                this.updatePosition()
                this.zoom() // 缩放
                this.graphEvent() // 绑定事件
            },

            // 根据类型搜索
            filterNode (type) {
                if (typeof type === 'string') {
                    const nodes = this.allNodes.filter(val => {
                        return val.type === type
                    })
                    this.graphUpdate(nodes, [])
                } else {
                    this.graphUpdate(this.allNodes, this.allEdges)
                }
            },

            // 查找附近相关节点和线
            searchMyNear (data) {
                let edges = []
                let nodes = []
                this.allEdges.forEach(val => {
                    if (val.source.id === data.id) {
                        if (!this.currentNodesId.hasOwnProperty(val.target.id)) {
                            nodes.push(val.target)
                        }
                        if (!this.currentEdgesId.hasOwnProperty(val.index)) {
                            edges.push(val)
                        }
                    } else if (val.target.id === data.id) {
                        if (!this.currentNodesId.hasOwnProperty(val.source.id)) {
                            nodes.push(val.source)
                        }
                        if (!this.currentEdgesId.hasOwnProperty(val.index)) {
                            edges.push(val)
                        }
                    }
                })
                nodes = this.currentNodes.concat(nodes)
                edges = this.currentEdges.concat(edges)
                this.graphUpdate(nodes, edges)
            }
        }
    }

    // 计算字符串实际占用长度，
    function occupyLength (str, length = 8) {
        str = str.toString()
        let len = 0
        for (let i = 0; i < str.length; i++) {
            if (str.charCodeAt(i) > 255) {
                len += 2 // 如果是汉字，则字符串长度加2
            } else {
                len++
            }
        }
        if (len > length) { // 超长
            let newStr = ''
            len = 0
            for (let i = 0; i < str.length; i++) {
                newStr += str.substr(i, 1)
                if (str.charCodeAt(i) > 255) {
                    len += 2 // 如果是汉字，则字符串长度加2
                } else {
                    len++
                }
                if (len >= length - 4) {
                    break
                }
            }
            return newStr + '...'
        }
        return str
    }

    // 计算 箭头 坐标
    function countAxis (d, radius) {
        let x1 = d.source.x
        let y1 = d.source.y
        let x2 = d.target.x
        let y2 = d.target.y

        let x, y

        const a = Math.abs(x1 - x2)
        const b = Math.abs(y1 - y2)
        const c = Math.sqrt(a * a + b * b)
        if (c === 0) {
            x = d.target.x
            y = d.target.y
            return {x, y}
        }
        const scale = radius / c

        const xx = x1 < x2 ? -1 : 1
        const yy = y1 < y2 ? -1 : 1

        x = x2 + (a * scale + 2) * xx
        y = y2 + (b * scale + 2) * yy

        return {x, y}
    }

    // 计算 连接线上 文字角度
    function countAxisRotate (d) {
        let x1 = d.source.x
        let x2 = d.target.x
        let y1 = d.source.y
        let y2 = d.target.y

        const a = Math.abs(x1 - x2)
        const b = Math.abs(y1 - y2)
        const c = Math.sqrt(a * a + b * b)

        let rotate = Math.asin(b / c)

        if (x1 === x2) {
            if (y1 === y2) {
                rotate = 0
            } else if (y1 < y2) {
                rotate = 90
            } else {
                rotate = -90
            }
        } else if (x1 < x2) {
            if (y1 === y2) {
                rotate = 0
            } else if (y1 > y2) {
                rotate *= -1
            }
        } else {
            if (y1 === y2) {
                rotate = 0
            } else if (y1 < y2) {
                rotate *= -1
            }
        }

        return rotate * 180 / Math.PI
    }

    // 简易弹窗 工具
    function layer (text, bgColor) {
        bgColor = bgColor ? '#19be6b' : '#f55145'
        let div = document.createElement('div')
        div.innerText = text
        style()
        document.body.appendChild(div)

        // 自动关闭
        let clear = setTimeout(function () {
            document.body.removeChild(div)
        }, 3000)

        // 点击关闭
        div.onclick = function () {
            clearTimeout(clear)
            document.body.removeChild(div)
        }

        function style () {
            div.style.background = bgColor
            div.style.textAlign = 'center'
            div.style.fontSize = '16px'
            div.style.color = '#fff'
            div.style.padding = '8px 16px'
            div.style.borderRadius = '4px'
            div.style.width = '50%'
            div.style.maxWidth = '600px'
            div.style.position = 'fixed'
            div.style.top = '75px'
            div.style.left = 0
            div.style.right = 0
            div.style.margin = 'auto'
            div.style.zIndex = 99999
        }
    }
</script>

<style>
    .knowledge-graph {
        width: 100%;
        height: 100%;
    }

    /* search */
    .search-box {
        padding: 30px 0;
    }
    .search-box>div {
        width: 40%;
        height: 44px;
        min-width: 400px;
        max-width: 600px;
        margin: auto;
        position: relative;

        border-radius: 2px;
        box-shadow: 0 2px 2px 0 rgba(0,0,0,0.16), 0 0 0 1px rgba(0,0,0,0.08);
        transition: box-shadow 200ms cubic-bezier(0.4, 0.0, 0.2, 1);
    }
    .search-box>div:hover {
        box-shadow: 0 3px 8px 0 rgba(0,0,0,0.2), 0 0 0 1px rgba(0,0,0,0.08);
    }
    .search-box input {
        display: block;
        width: 100%;
        height: 100%;
        border: none;
        padding: 0 65px 0 16px;
        font-size: 16px;
    }
    .search-box button {
        position: absolute;
        right: 0;
        top: 0;
        bottom: 0;
        display: block;
        width: 56px;
        border: none;
        cursor: pointer;
        font-size: 16px;
        background-position: center;
        background-repeat: no-repeat;
        background-image: url("/static_ref1/img/search.png");
    }
    .search-box button:hover {
        background-image: url("/static_ref1/img/search_hover.png");
    }

    /* svg */
    .svg-box {
        width: 100%;
        height: calc(100% - 134px);
        overflow: hidden;
        position: relative;
    }

    /* tips */
    .tooltip-popper {
        display: block;
        padding-top: 8px;
        font-size: 12px;
        line-height: 1.5;
        position: fixed;
        z-index: 1060;
        transform: translateX(-50%);
    }
    .tooltip-arrow {
        position: absolute;
        left: 50%;
        top: 3px;
        margin-left: -5px;
        width: 0;
        height: 0;
        border-width: 0 5px 5px;
        border-color: transparent;
        border-bottom-color: rgb(70,76,91);
        border-style: solid;
    }
    .tooltip-inner {
        max-width: 250px;
        min-height: 34px;
        padding: 8px 12px;
        box-sizing: border-box;
        color: #fff;
        text-align: left;
        text-decoration: none;
        background-color: rgba(70,76,91,1);
        border-radius: 4px;
        box-shadow: 0 1px 6px rgba(0,0,0,.2);
    }

    /* 实体类型列表 */
    .type-list {
        position: absolute;
        left: 0;
        top: 1px;
        width: 100%;
        min-height: 32px;
        line-height: 32px;
        padding: 0 20px;
        box-sizing: border-box;
        border-bottom: 1px solid #e6e9ef;
        background-color: #f9fbfd;
        color: #fff;
        font-size: 12px;
    }
    .type-list span {
        margin: 0 5px;
        padding: 2px 8px;
        border-radius: 20px;
        cursor: pointer;
        transition: .3s;
    }
    .type-list span:hover  {
        filter: brightness(1.1);
    }

    .svg-box svg{
        display: block;
        width: 100%;
        height: 100%;
        margin: auto;
        box-sizing: border-box;
        border: 1px solid rgba(0,0,0,0.16);
        cursor: move;
    }
    /* 连接线样式 */
    .links line {
        stroke: rgb(165, 171, 182);
        stroke-width: 1px;
    }
    /* 连接线上文字样式 */
    .link-text text {
        cursor: pointer;
        font-size: 13px;
    }
    /* 节点名称 */
    .node-text text{
        font-size: 14px;
        fill: #fff;
        cursor: pointer;
        text-anchor: middle;
        dominant-baseline: middle;
    }
    /* 节点 */
    .nodes circle {
        stroke-width: 2px;
    }

</style>

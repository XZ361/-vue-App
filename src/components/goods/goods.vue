<template>
   <div>
   <div class="goods">
        <div class="menu-wrapper" ref="menuWrapper">
            <ul>
                <li v-for="(item,index) in goods" :key="item.num" class="menu-item" :class="{'current':currentIndex===index}" @click="selectMenu(index,$event)">
                    <span class="text border-2px">
                        <span class="icon" v-show="item.type>0" :class="classMap[item.type]"></span>{{item.name}}
                    </span>
                </li>
            </ul>
        </div>
        <div class="foods-wrapper" ref="foodsWrapper">
            <ul>
                <li class="food-list food-list-hook" v-for="item in goods" :key="item.num">
                    <h1 class="title">{{item.name}}</h1>
                    <ul>
                        <li v-for="food in item.foods" class="food-item border-1px" :key="food.num" @click="selectFood(food,$event)">
                            <div class="icon">
                                <img :src="food.icon" alt="" width="57" height="57">
                            </div>
                             <div class="content">
                                <h2 class="name">{{food.name}}</h2>
                                <p class="desc">{{food.description}}</p>
                                <div class="extra">
                                    <span class="count">月售{{food.sellCount}}份</span><span>好评率{{food.rating}}%</span>
                                </div>
                                <div class="price">
                                    <span class="now">￥{{food.price}}</span>
                                    <span class="old" v-show="food.oldPrice">￥{{food.oldPrice}}</span>
                                </div>
                                <div class="cartcontrol-wrapper" >
                                    <cartcontrol :food="food" @add="addFood"></cartcontrol>
                                </div>
                            </div>
                        </li>
                    </ul>
                </li>
            </ul>
        </div>
        <shopcart ref="shopcart" :deliveryPrice="seller.deliveryPrice" :minPrice="seller.minPrice" :selectFoods="selectFoods"></shopcart>
   </div>
        <food @add="addFood" :food="selectedFood" ref="food"></food>
    </div>
</template>

<script>
import BScroll from 'better-scroll'
import shopcart from '../shopcart/shopcart'
import cartcontrol from '../cartcontrol/cartcontrol'
import food from '../food/food'
const ERR_OK = 0
export default{
  props: {
    seller: {
      type: Object
    }
  },
  data () {
    return {
      goods: [], // 开始时goods为空数组，当goods组件被调用时,goods获取后后端传来的数据
      listHeight: [],
      scrollY: 0,
      selectedFood: {}
    }
  },
  computed: {
    currentIndex () {
      for (let i = 0; i < this.listHeight.length; i++) {
        let height1 = this.listHeight[i]
        let height2 = this.listHeight[i + 1]
        if (!height2 || (this.scrollY >= height1 && this.scrollY < height2)) {
          return i
        }
      }
      return 0
    },
    selectFoods () {
      let foods = []
      this.goods.forEach((good) => {
        good.foods.forEach((food) => {
          if (food.count) {
            foods.push(food)
          }
        })
      })
      return foods
    }
  },
  created () {
    this.classMap = ['decrease', 'discount', 'special', 'invoice', 'guarantee']
    this.$http.get('/api/goods').then((response) => {
      response = response.body
      if (response.errno === ERR_OK) {
        this.goods = response.data
        this.$nextTick(() => { // 在这个函数中调用以防内容还未加载完就执行，获取不到元素的高度导致无法滑动
          this._initScroll() // 通过一步函数执行scroll初始化函数,等dom结构完全加载结束在调用_initScroll()方法
          this._calculateHeight() // 计算高度
        })
      }
    })
  },
  methods: {
    selectMenu (index, event) {
      if (!event._constructed) {
        return
      }
      let foodList = this.$refs.foodsWrapper.getElementsByClassName('food-list-hook')
      let el = foodList[index]
      this.foodsScroll.scrollToElement(el, 300)
    },
    selectFood (food, event) {
      if (!event._constructed) {
        return
      }
      this.selectedFood = food
      this.$refs.food.show()
    },
    addFood (target) {
      this._drop(target)
    },
    _drop (target) {
      // 体验优化,异步执行下落动画,goods组件在执行_drop(target) 中，获取shopcart子组件的ref，调用shopcart子组件的drop（el)方法
      this.$nextTick(() => {
        this.$refs.shopcart.drop(target)
      })
    },
    _initScroll () { // 用来对左右两侧dom结构进行初始化。
      this.menuScroll = new BScroll(this.$refs.menuWrapper, {
        click: true
      })
      this.foodsScroll = new BScroll(this.$refs.foodsWrapper, {
        probeType: 3,
        click: true
      })// 获取dom并实例化一个Bscroll对象
      this.foodsScroll.on('scroll', (pos) => {
        this.scrollY = Math.abs(Math.round(pos.y)) // 现将小数转化成整数，再讲负数转化成正数
      })
    },
    _calculateHeight () {
      let foodList = this.$refs.foodsWrapper.getElementsByClassName('food-list-hook')
      let height = 0
      this.listHeight.push(height)
      for (let i = 0; i < foodList.length; i++) {
        let item = foodList[i]
        height += item.clientHeight
        this.listHeight.push(height)
      }
    }
  },
  components: {
    shopcart,
    cartcontrol,
    food
  }
}
</script>

<style lang="stylus" rel="stylesheet/stylus">
    @import  '../../common/stylus/mixin.styl'
    .goods
        display: flex
        position: absolute
        top: 170px
        bottom: 46px
        width: 100%
        overflow: hidden
        .menu-wrapper
            flex: 0 0 80px
            width: 80px
            background: #f3f5f7
            .menu-item
                display: table
                height: 54px
                width: 56px
                line-height: 14px
                &.current
                    position: relative
                    z-index: 10
                    margin-top: -1px
                    background: #fff
                    font-weight: 700
                    .text
                        border-none()
                padding: 0 12px
                .icon
                    display: inline-block
                    vertical-align: top
                    width: 12px
                    height: 12px
                    margin-right: 2px
                    background-size: 12px 12px
                    background-repeat: no-repeat
                    &.decrease
                        bg-image('decrease_3')
                    &.discount
                        bg-image('discount_3')
                    &.guarantee
                        bg-image('guarantee_3')
                    &.invoice
                        bg-image('invoice_3')
                    &.special
                        bg-image('special_3')
                .text
                    display: table-cell
                    width: 56px
                    vertical-align: middle
                    border-2px(rgba(7,17,27,0.1))
                    font-size: 12px
        .foods-wrapper
            flex: 1
            .title
                padding-left: 14px
                height: 26px
                line-height: 26px
                border-left: 2px solid #d9dde1
                font-size: 12px
                color: rgb(147,153,159)
                background: #f3f5f7
            .food-item
                display: flex
                margin: 18px
                padding-bottom: 18px
                border-1px(rgba(7,17,27,0.1))
                &:last-child
                    border-none()
                    margin-bottom: 0
            .icon
                flex: 0 0 57px
                margin-right: 10px
            .content
                flex: 1
                .name
                    margin: 2px 0 8px 0
                    height: 14px
                    line-height: 14px
                    font-size: 14px
                    color: rgb(7,17,27)
                .desc, .extra
                    line-height: 10px
                    font-size: 10px
                    color: rgb(147,153,159)
                .desc
                    line-height: 12px
                    margin-bottom: 8px
                .extra
                    .count
                        margin-right: 12px
                .price
                    font-weight: 700
                    line-height: 24px
                    .now
                        margin-right: 18px
                        font-size: 14px
                        color: rgb(240,20,20)
                    .old
                        text-decoration: line-through
                        font-size: 10px
                        color: rgb(147,153,159)
                .cartcontrol-wrapper
                    position: absolute
                    right: 0
                    bottom: 12px
</style>

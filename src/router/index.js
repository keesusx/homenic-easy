import { createRouter, createWebHistory } from 'vue-router'
import HomeView    from '../views/HomeView.vue'
import IotView     from '../views/IotView.vue'
import BookingView from '../views/BookingView.vue'
import NoticeView  from '../views/NoticeView.vue'
import CarRegView  from '../views/CarRegView.vue'
import ChatView    from '../views/ChatView.vue'

const routes = [
  { path: '/',        component: HomeView,    name: 'home'    },
  { path: '/iot',     component: IotView,     name: 'iot'     },
  { path: '/booking', component: BookingView, name: 'booking' },
  { path: '/notice',  component: NoticeView,  name: 'notice'  },
  { path: '/car',     component: CarRegView,  name: 'car'     },
  { path: '/chat',    component: ChatView,    name: 'chat'    },
]

export default createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 }),
})

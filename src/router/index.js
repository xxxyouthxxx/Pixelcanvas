import { createRouter, createWebHashHistory } from "vue-router";

const routes = [
    {
        path: "/",
        name: "Home",
        component: () => import("../views/Canvas.vue"),
    },
    {
        path:"/login",
        name:"login",
        component: () => import("../views/Login.vue"),
    }
]

const router = createRouter({
    history: createWebHashHistory(),
    routes,
})

export default router
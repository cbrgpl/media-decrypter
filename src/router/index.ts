import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/crypto-key',
    name: 'CryptoKey',
    component: () => import('@/views/CryptoKey/CryptoKey.vue'),
    children: [],
  },
  {
    path: '/encrypter',
    name: 'Encrypter',
    component: () => import('@/views/EncrypterPage/EncrypterPage.vue'),
    children: [],
  },
  {
    path: '/gallery',
    name: 'Gallery',
    component: () => import('@/views/GalleryPage/GalleryPage.vue'),
    children: [],
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: { name: 'CryptoKey' },
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export { router };

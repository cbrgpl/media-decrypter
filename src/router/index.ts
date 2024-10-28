import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/crypto-key',
    name: 'CryptoKey',
    component: () => import('@/views/CryptoKey/CryptoKey.vue'),
  },
  {
    path: '/encrypter',
    name: 'Encrypter',
    component: () => import('@/views/EncrypterPage/EncrypterPage.vue'),
  },
  {
    path: '/gallery',
    name: 'Gallery',
    component: () => import('@/views/GalleryPage/GalleryPage.vue'),
  },
  {
    path: '/',
    name: 'Default',
    component: () => import('@/views/DefaultPage.vue'),
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

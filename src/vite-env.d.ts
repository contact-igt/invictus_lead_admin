/// <reference types="vite/client" />

declare module 'echarts/core';
declare module 'echarts/charts';
declare module 'echarts/components';
declare module 'echarts/renderers';
declare module 'echarts/features';

declare module 'swiper/react' {
  export const Swiper: any;
  export const SwiperSlide: any;
  export type SwiperProps = any;
}

declare module 'swiper/types' {
  export type Swiper = any;
  export type SwiperOptions = any;
}

declare module 'swiper/modules' {
  export const Navigation: any;
  export const Pagination: any;
  export const Scrollbar: any;
  export const A11y: any;
}

declare module '@reduxjs/toolkit' {
  export const createSlice: any;
  export const configureStore: any;
  export type PayloadAction<P = any> = {
    payload: P;
    type: string;
  };
}

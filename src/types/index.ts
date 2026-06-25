export interface Section {
  id: string;
  name: string;
}

export interface SlideItem {
  id: number;
  title: string;
  img: string;
}

export interface GridNewsItem {
  section: string;
  id: number;
  title: string;
  body: string;
  img: string;
}

export interface TickerItem {
  id: number;
  text: string;
}

export interface RankingNewsItem {
  id: number;
  title: string;
  img: string;
}

export interface RealtimeNewsItem {
  id: number;
  title: string;
  img: string;
  main?: boolean;
}

export type RiskLevel = "low" | "medium" | "high";
export type AiStatus = "reserved" | "configured";
export type DataSourceStatus = "available" | "missing" | "planned";
export type DataProvenanceStatus = "unverified" | "verified";
export type MetricStatus = "pending" | "verified";
export type ProductFactStatus = "known" | "pending";

export interface DataSource {
  name: string;
  status: DataSourceStatus;
  note: string;
  images?: DataSourceImage[];
  visualization?: DataSourceVisualization;
}

export interface DataSourceImage {
  src: string;
  alt: string;
  caption: string;
}

export interface DataSourceVisualizationPoint {
  label: string;
  value: number | null;
}

export interface DataSourceVisualization {
  title: string;
  points: DataSourceVisualizationPoint[];
}

export interface DataProvenance {
  status: DataProvenanceStatus;
  summary: string;
  disclaimer: string;
  sources: DataSource[];
}

export interface ProductProfile {
  name: string;
  brand: string;
  category: string;
  launchContext: string;
  heroTagline: string;
  imageUrl?: string | null;
}

export interface ProductFact {
  label: string;
  value: string;
  status: ProductFactStatus;
  source: string;
}

export interface DeploymentItem {
  title: string;
  status: MetricStatus;
  description: string;
  inputNeeded: string;
}

export interface ProductDetail {
  status: DataProvenanceStatus;
  summary: string;
  facts: ProductFact[];
  deploymentItems: DeploymentItem[];
  reviewNote: string;
}

export interface KeyMetric {
  label: string;
  value: number | null;
  unit: string;
  trend: string;
  status: MetricStatus;
  source: string;
}

export interface AudienceSegment {
  name: string;
  share: number | null;
  insight: string;
}

export interface SellingPoint {
  title: string;
  detail: string;
  strength: number | null;
}

export interface PersonaChartDimension {
  label: string;
  items: { name: string; value: number; color?: string }[];
}

export interface UserPersonaInsight {
  name: string;
  status: MetricStatus;
  source: string;
  insight: string;
  charts?: PersonaChartDimension[];
}

export interface HotWordCloudTerm {
  label: string;
  status: MetricStatus;
  source: string;
  weight: number | null;
}

export interface PopularContentInsight {
  channel: string;
  title: string;
  status: MetricStatus;
  source: string;
  reason: string;
}

export interface CoreInsights {
  userPersonas: UserPersonaInsight[];
  hotWordCloud: HotWordCloudTerm[];
  popularContents: PopularContentInsight[];
}

export interface CompetitorSlot {
  name: string;
  category: string;
  status: MetricStatus;
  source: string;
  note: string;
  imageUrl?: string;
  price?: number;
  originalPrice?: number;
  discount?: string;
  salesVolume?: string;
  storeCount?: number;
  rating?: string;
  features?: string[];
  flavor?: string;
  volume?: string;
  sellingPoints?: string[];
}

export interface CompetitorDimension {
  label: string;
  currentProduct: string;
  competitorPool: string;
  status: MetricStatus;
  source: string;
}

export interface CompetitorOpportunity {
  title: string;
  status: MetricStatus;
  description: string;
  inputNeeded: string;
}

export interface CompetitorAnalysis {
  status: DataProvenanceStatus;
  summary: string;
  competitors: CompetitorSlot[];
  dimensions: CompetitorDimension[];
  opportunities: CompetitorOpportunity[];
  methodology: string[];
}

export interface KnowledgeSection {
  title: string;
  items: string[];
}

export interface KnowledgeEntry {
  category: string;
  title: string;
  summary: string;
  points: string[];
  tags?: string[];
  sections?: KnowledgeSection[];
  source: string;
}

export interface KnowledgeBase {
  disclaimer: string;
  entries: KnowledgeEntry[];
}

export interface RiskSignal {
  title: string;
  level: RiskLevel;
  mitigation: string;
}

export interface SentimentPoint {
  name: string;
  value: number;
}

export interface PurchaseDriverPoint {
  name: string;
  value: number;
}

export interface TrendPoint {
  stage: string;
  score: number;
}

export interface VisualizationData {
  sentiment: SentimentPoint[];
  purchaseDrivers: PurchaseDriverPoint[];
  trend: TrendPoint[];
}

export interface AiReservation {
  provider: "zhipu";
  status: AiStatus;
  endpointHint: string;
  note: string;
}

export interface ProductReport {
  dataProvenance: DataProvenance;
  product: ProductProfile;
  productDetail: ProductDetail;
  executiveSummary: string[];
  keyMetrics: KeyMetric[];
  audienceSegments: AudienceSegment[];
  sellingPoints: SellingPoint[];
  coreInsights: CoreInsights;
  competitorAnalysis?: CompetitorAnalysis;
  knowledgeBase: KnowledgeBase;
  riskSignals: RiskSignal[];
  visualizations: VisualizationData;
  ai: AiReservation;
}

export interface ChartSeries {
  sentimentLegend: string[];
  purchaseDriverNames: string[];
  purchaseDriverValues: number[];
  trendPoints: Array<[string, number]>;
}

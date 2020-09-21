// the published @types/google.visualization doesn't include Gauge yet
// added a stub here to keep typescript happy

declare namespace google {
    namespace visualization {
        export class Gauge extends CoreChartBase {
            draw(data: DataTable | DataView, options?: GaugeOptions): void;
        }
    }
}
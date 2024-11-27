import { Controller, Get, Render } from '@nestjs/common';
import { IotService } from '../iot/iot.service';

@Controller('dashboard')
export class DashboardController {
  abc = 0
  constructor(private readonly iotService: IotService) {}

  @Get()
  @Render('dashboard')
  async getDashboardPage() {
    const [
      hydraulicPressData,
      latheMachineData,
      conveyorBeltData,
      productionInsights,
    ] = await Promise.all([
      this.iotService.getLatestHydraulicPressData(),
      this.iotService.getLatestLatheMachineData(),
      this.iotService.getLatestConveyorBeltData(),
      this.iotService.getProductionInsights(),
    ]);

    return {
      title: 'Dashboard IoT Industrial',
      hydraulicPressData,
      latheMachineData,
      conveyorBeltData,
      productionInsights,
    };
  }

  @Get('/data/insights')
  @Render('partials/insights')
  async getInsightsPartial() {
    const productionInsights = await this.iotService.getProductionInsights();
    return { productionInsights };
  }

  @Get('/data/tables')
  @Render('partials/tables')
  async getTablesPartial() {
    const [
      hydraulicPressData,
      latheMachineData,
      conveyorBeltData,
    ] = await Promise.all([
      this.iotService.getLatestHydraulicPressData(),
      this.iotService.getLatestLatheMachineData(),
      this.iotService.getLatestConveyorBeltData(),
    ]);

    return {
      hydraulicPressData,
      latheMachineData,
      conveyorBeltData,
    };
  }

  @Get('/data/charts')
  async getChartsData() {
    // Busca os dados para os gráficos
    const [pressureChartData, operationChartData] = await Promise.all([
      this.iotService.getHydraulicPressPressureHistory(),
      this.iotService.getOperationTimeByMachine(),
    ]);

    // Formata os dados para o frontend
    return {
      pressureChartData: {
        labels: pressureChartData.map((item) => item.timestamp),
        data: pressureChartData.map((item) => item.pressure),
      },
      operationChartData: {
        labels: ['Prensa Hidráulica', 'Torno Mecânico', 'Esteira Transportadora'],
        data: [
          operationChartData.hydraulicPress,
          operationChartData.latheMachine,
          operationChartData.conveyorBelt,
        ],
      },
    };
  }
}

import { EventHubConsumerClient } from '@azure/event-hubs';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class IotService implements OnModuleInit {
  consumer: EventHubConsumerClient;

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    const connectionString = process.env.AZURE_EVENT_HUB;
    const eventHubName = process.env.AZURE_HUB_NAME;

    console.log('Conectando ao Event Hub para consumir mensagens...');

    this.consumer = new EventHubConsumerClient(
      '$Default',
      connectionString,
      eventHubName,
    );

    this.consumer.subscribe({
      processEvents: async (events, context) => {
        for (const event of events) {
          const data = String(event.body).replaceAll("'", '"');
          const machineType = event.properties?.machineType || 'unknown';

          console.log(`Mensagem recebida (${machineType}):`, data);

          // Salvar dados com base no tipo de máquina
          await this.saveSensorData(machineType, JSON.parse(data));
        }
      },
      processError: async (err, context) => {
        console.error('Erro ao consumir mensagens:', err.message);
      },
    });
  }

  private formatTimestamp(timestamp: Date) {
    const formattedDate = timestamp.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    const formattedTime = timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', hour12: false });

    return `${formattedDate}-${formattedTime}`;
  }

  private async saveSensorData(machineType: string, data: any) {
    try {
      if (machineType === 'hydraulic_press') {
        await this.prisma.hydraulicPressData.create({
          data: {
            machineId: data.machine_id,
            pressure: data.pressure,
            oilTemperature: data.oil_temperature,
            operationTime: data.operation_time,
            timestamp: new Date(data.timestamp || Date.now()),
          },
        });
      } else if (machineType === 'lathe_machine') {
        await this.prisma.latheMachineData.create({
          data: {
            machineId: data.machine_id,
            rpm: data.rpm,
            temperature: data.temperature,
            vibration: data.vibration,
            timestamp: new Date(data.timestamp || Date.now()),
          },
        });
      } else if (machineType === 'conveyor_belt') {
        await this.prisma.conveyorBeltData.create({
          data: {
            machineId: data.machine_id,
            speed: data.speed,
            load: data.load,
            motorTemperature: data.motor_temperature,
            timestamp: new Date(data.timestamp || Date.now()),
          },
        });
      } else {
        console.warn(`Tipo de máquina desconhecido: ${machineType}`);
      }

      console.log(`Dados do sensor (${machineType}) salvos com sucesso!`);
    } catch (error) {
      console.error(`Erro ao salvar dados (${machineType}):`, error.message);
    }
  }

  async getLatestHydraulicPressData() {
    const data = await this.prisma.hydraulicPressData.findMany({
      orderBy: { timestamp: 'desc' },
      take: 10,
    });

    return data.map((item) => ({
      ...item,
      timestamp: this.formatTimestamp(item.timestamp),
    }));
  }

  async getLatestLatheMachineData() {
    const data = await this.prisma.latheMachineData.findMany({
      orderBy: { timestamp: 'desc' },
      take: 10,
    });

    return data.map((item) => ({
      ...item,
      timestamp: this.formatTimestamp(item.timestamp),
    }));
  }

  async getLatestConveyorBeltData() {
    const data = await this.prisma.conveyorBeltData.findMany({
      orderBy: { timestamp: 'desc' },
      take: 10,
    });

    return data.map((item) => ({
      ...item,
      timestamp: this.formatTimestamp(item.timestamp),
    }));
  }

  // Gera insights com base nos dados do banco
  async getProductionInsights() {
    const [hydraulicStats, latheStats, conveyorStats] = await Promise.all([
      this.getHydraulicPressInsights(),
      this.getLatheMachineInsights(),
      this.getConveyorBeltInsights(),
    ]);

    return { hydraulicStats, latheStats, conveyorStats };
  }

  private async getHydraulicPressInsights() {
    const data = await this.prisma.hydraulicPressData.findMany();

    const totalOperationTime = data.reduce((sum, item) => sum + item.operationTime, 0);
    const averagePressure = data.reduce((sum, item) => sum + item.pressure, 0) / data.length;
    const averageOilTemperature =
      data.reduce((sum, item) => sum + item.oilTemperature, 0) / data.length;

    return {
      totalOperationTime,
      averagePressure: averagePressure.toFixed(2),
      averageOilTemperature: averageOilTemperature.toFixed(2),
    };
  }

  private async getLatheMachineInsights() {
    const data = await this.prisma.latheMachineData.findMany();

    const averageRPM = data.reduce((sum, item) => sum + item.rpm, 0) / data.length;
    const averageTemperature = data.reduce((sum, item) => sum + item.temperature, 0) / data.length;
    const highVibrationCount = data.filter((item) => item.vibration > 3.0).length;

    return {
      averageRPM: averageRPM.toFixed(2),
      averageTemperature: averageTemperature.toFixed(2),
      highVibrationCount,
    };
  }

  private async getConveyorBeltInsights() {
    const data = await this.prisma.conveyorBeltData.findMany();

    const totalLoad = data.reduce((sum, item) => sum + item.load, 0);
    const averageSpeed = data.reduce((sum, item) => sum + item.speed, 0) / data.length;
    const averageMotorTemperature =
      data.reduce((sum, item) => sum + item.motorTemperature, 0) / data.length;

    return {
      totalLoad: totalLoad.toFixed(2),
      averageSpeed: averageSpeed.toFixed(2),
      averageMotorTemperature: averageMotorTemperature.toFixed(2),
    };
  }

  async getHydraulicPressPressureHistory() {
    return this.prisma.hydraulicPressData.findMany({
      orderBy: { timestamp: 'desc' },
      take: 10, // Últimas 10 leituras
    });
  }
  
  async getOperationTimeByMachine() {
    const [hydraulicPressTime, latheTime, conveyorTime] = await Promise.all([
      this.prisma.hydraulicPressData.aggregate({
        _sum: { operationTime: true },
      }),
      this.prisma.latheMachineData.aggregate({
        _sum: { vibration: true }, // Apenas como exemplo; ajustar conforme necessário
      }),
      this.prisma.conveyorBeltData.aggregate({
        _sum: { load: true },
      }),
    ]);
  
    return {
      hydraulicPress: hydraulicPressTime._sum.operationTime || 0,
      latheMachine: latheTime._sum.vibration || 0,
      conveyorBelt: conveyorTime._sum.load || 0,
    };
  }
}

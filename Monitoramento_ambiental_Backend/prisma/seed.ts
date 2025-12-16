import { PrismaClient, UserRole, SensorType } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  const hashedPassword = await bcrypt.hash('admin123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@monitoramento.com' },
    update: {},
    create: {
      email: 'admin@monitoramento.com',
      name: 'Administrador',
      password: hashedPassword,
      role: UserRole.ADMIN,
    },
  });

  const gestor = await prisma.user.upsert({
    where: { email: 'gestor@monitoramento.com' },
    update: {},
    create: {
      email: 'gestor@monitoramento.com',
      name: 'Gestor Ambiental',
      password: hashedPassword,
      role: UserRole.GESTOR,
    },
  });

  const pesquisador = await prisma.user.upsert({
    where: { email: 'pesquisador@monitoramento.com' },
    update: {},
    create: {
      email: 'pesquisador@monitoramento.com',
      name: 'Pesquisador',
      password: hashedPassword,
      role: UserRole.PESQUISADOR,
    },
  });

  const tecnico = await prisma.user.upsert({
    where: { email: 'tecnico@monitoramento.com' },
    update: {},
    create: {
      email: 'tecnico@monitoramento.com',
      name: 'Técnico',
      password: hashedPassword,
      role: UserRole.TECNICO,
    },
  });

  console.log('✅ Usuários criados');

  const station1 = await prisma.station.upsert({
    where: { id: 'station-1' },
    update: {},
    create: {
      id: 'station-1',
      name: 'Estação Praia das Tartarugas',
      description: 'Monitoramento de tartarugas marinhas e qualidade da água',
      latitude: -23.5505,
      longitude: -46.6333,
      isActive: true,
    },
  });

  const station2 = await prisma.station.upsert({
    where: { id: 'station-2' },
    update: {},
    create: {
      id: 'station-2',
      name: 'Estação Reserva Mata Atlântica',
      description: 'Monitoramento de biodiversidade e qualidade do ar',
      latitude: -23.5489,
      longitude: -46.6388,
      isActive: true,
    },
  });

  const station3 = await prisma.station.upsert({
    where: { id: 'station-3' },
    update: {},
    create: {
      id: 'station-3',
      name: 'Estação Rio Limpo',
      description: 'Monitoramento de qualidade da água do rio',
      latitude: -23.5521,
      longitude: -46.6312,
      isActive: true,
    },
  });

  console.log('✅ Estações criadas');

  const sensors = [
    {
      stationId: station1.id,
      name: 'Temperatura da Água',
      type: SensorType.TEMPERATURA,
      unit: '°C',
      minValue: 20,
      maxValue: 30,
      alertThreshold: 28,
    },
    {
      stationId: station1.id,
      name: 'Presença de Tartarugas',
      type: SensorType.PRESENCA_ESPECIE,
      unit: 'unidades',
      minValue: 0,
      maxValue: 100,
      alertThreshold: 0,
    },
    {
      stationId: station1.id,
      name: 'Qualidade da Água',
      type: SensorType.QUALIDADE_AGUA,
      unit: 'Índice',
      minValue: 0,
      maxValue: 100,
      alertThreshold: 50,
    },
    {
      stationId: station1.id,
      name: 'pH da Água',
      type: SensorType.PH,
      unit: 'pH',
      minValue: 6.5,
      maxValue: 8.5,
      alertThreshold: 7.0,
    },
    {
      stationId: station2.id,
      name: 'Temperatura do Ar',
      type: SensorType.TEMPERATURA,
      unit: '°C',
      minValue: 15,
      maxValue: 35,
      alertThreshold: 32,
    },
    {
      stationId: station2.id,
      name: 'Umidade',
      type: SensorType.UMIDADE,
      unit: '%',
      minValue: 40,
      maxValue: 90,
      alertThreshold: 30,
    },
    {
      stationId: station2.id,
      name: 'Qualidade do Ar',
      type: SensorType.QUALIDADE_AR,
      unit: 'AQI',
      minValue: 0,
      maxValue: 500,
      alertThreshold: 100,
    },
    {
      stationId: station3.id,
      name: 'Oxigênio Dissolvido',
      type: SensorType.OXIGENIO_DISSOLVIDO,
      unit: 'mg/L',
      minValue: 5,
      maxValue: 12,
      alertThreshold: 6,
    },
    {
      stationId: station3.id,
      name: 'Turbidez',
      type: SensorType.TURBIDEZ,
      unit: 'NTU',
      minValue: 0,
      maxValue: 50,
      alertThreshold: 25,
    },
    {
      stationId: station3.id,
      name: 'pH',
      type: SensorType.PH,
      unit: 'pH',
      minValue: 6.5,
      maxValue: 8.5,
      alertThreshold: 7.0,
    },
  ];

  const createdSensors = [];
  for (const sensorData of sensors) {
    const sensor = await prisma.sensor.create({
      data: sensorData,
    });
    createdSensors.push(sensor);
  }

  console.log('✅ Sensores criados');

  console.log('📊 Criando readings de exemplo...');
  
  for (const sensor of createdSensors) {
    const readings = [];
    const now = new Date();
    
    // Criar readings das últimas 24 horas (uma leitura a cada 30 minutos = 48 readings)
    for (let i = 48; i >= 0; i--) {
      const timestamp = new Date(now.getTime() - i * 30 * 60 * 1000); // 30 minutos atrás
      
      let baseValue = 0;
      let variation = 0;
      
      switch (sensor.type) {
        case SensorType.TEMPERATURA:
          if (sensor.unit === '°C') {
            baseValue = sensor.minValue || 20 + (sensor.maxValue || 30 - (sensor.minValue || 20)) / 2;
            variation = (Math.random() - 0.5) * 4;
          } else {
            baseValue = sensor.minValue || 20 + (sensor.maxValue || 35 - (sensor.minValue || 15)) / 2;
            variation = (Math.random() - 0.5) * 6;
          }
          break;
        case SensorType.UMIDADE:
          baseValue = sensor.minValue || 60 + (sensor.maxValue || 90 - (sensor.minValue || 60)) / 2;
          variation = (Math.random() - 0.5) * 10;
          break;
        case SensorType.QUALIDADE_AR:
          baseValue = sensor.minValue || 50 + (sensor.maxValue || 100 - (sensor.minValue || 50)) / 2;
          variation = (Math.random() - 0.5) * 30;
          break;
        case SensorType.QUALIDADE_AGUA:
          baseValue = sensor.minValue || 70 + (sensor.maxValue || 100 - (sensor.minValue || 70)) / 2;
          variation = (Math.random() - 0.5) * 20;
          break;
        case SensorType.PRESENCA_ESPECIE:
          baseValue = Math.random() > 0.7 ? Math.floor(Math.random() * 10) + 1 : 0;
          variation = 0;
          break;
        case SensorType.PH:
          baseValue = sensor.minValue || 7.0 + (sensor.maxValue || 8.0 - (sensor.minValue || 7.0)) / 2;
          variation = (Math.random() - 0.5) * 0.5;
          break;
        case SensorType.TURBIDEZ:
          baseValue = sensor.minValue || 10 + (sensor.maxValue || 30 - (sensor.minValue || 10)) / 2;
          variation = (Math.random() - 0.5) * 10;
          break;
        case SensorType.OXIGENIO_DISSOLVIDO:
          baseValue = sensor.minValue || 8 + (sensor.maxValue || 12 - (sensor.minValue || 8)) / 2;
          variation = (Math.random() - 0.5) * 2;
          break;
        default:
          baseValue = sensor.minValue || 0 + (sensor.maxValue || 100 - (sensor.minValue || 0)) / 2;
          variation = (Math.random() - 0.5) * 10;
      }
      
      const hourOfDay = timestamp.getHours();
      let timeVariation = 0;
      
      if (sensor.type === SensorType.TEMPERATURA && sensor.unit === '°C') {
        timeVariation = Math.sin((hourOfDay - 6) * Math.PI / 12) * 3;
      } else if (sensor.type === SensorType.UMIDADE) {
        timeVariation = -Math.sin((hourOfDay - 6) * Math.PI / 12) * 5;
      }
      
      const value = Math.max(
        sensor.minValue || 0,
        Math.min(
          sensor.maxValue || 100,
          baseValue + variation + timeVariation
        )
      );
      
      readings.push({
        stationId: sensor.stationId,
        sensorId: sensor.id,
        value: Math.round(value * 100) / 100,
        timestamp: timestamp,
      });
    }
    
    await prisma.reading.createMany({
      data: readings,
    });
  }

  console.log('✅ Readings criados');
  console.log('🎉 Seed concluído com sucesso!');
  console.log('\n📧 Credenciais de acesso:');
  console.log('Admin: admin@monitoramento.com / admin123');
  console.log('Gestor: gestor@monitoramento.com / admin123');
  console.log('Pesquisador: pesquisador@monitoramento.com / admin123');
  console.log('Técnico: tecnico@monitoramento.com / admin123');
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

import random
import time
from azure.iot.device import IoTHubDeviceClient, Message
from dotenv import load_dotenv
import os
from datetime import datetime

load_dotenv()

# Conexão com o IoT Hub
CONNECTION_STRING = os.getenv("AZURE_CONNECTION")

# Mensagem de Telemetria (Simulação de Sensor)
def generate_sensor_data(machine_type):
    current_time = datetime.now().isoformat()  # Timestamp em formato ISO 8601
    if machine_type == "lathe_machine":  # Torno Mecânico
        return {
            "machine_id": "lathe-001",
            "timestamp": current_time,
            "rpm": round(random.uniform(1000, 3000), 2),  # Rotação por minuto
            "temperature": round(random.uniform(50, 120), 2),  # Temperatura em °C
            "vibration": round(random.uniform(0, 5), 2),  # Vibração (G-force)
        }
    elif machine_type == "hydraulic_press":  # Prensa Hidráulica
        return {
            "machine_id": "press-002",
            "timestamp": current_time,
            "pressure": round(random.uniform(100, 300), 2),  # Pressão em PSI
            "oil_temperature": round(random.uniform(30, 90), 2),  # Temperatura do óleo em °C
            "operation_time": random.randint(0, 500),  # Tempo de operação em minutos
        }
    elif machine_type == "conveyor_belt":  # Esteira Transportadora
        return {
            "machine_id": "belt-003",
            "timestamp": current_time,
            "speed": round(random.uniform(0.5, 3.0), 2),  # Velocidade em m/s
            "load": round(random.uniform(50, 500), 2),  # Carga transportada em kg
            "motor_temperature": round(random.uniform(40, 100), 2),  # Temperatura do motor em °C
        }
    else:
        return {}
    

def send_machine_data(client, machine_type):
    sensor_data = generate_sensor_data(machine_type)
    if sensor_data:
        message = Message(str(sensor_data))
        message.content_type = "application/json"
        message.custom_properties["machineType"] = machine_type
        
        # Envia a mensagem para o IoT Hub
        client.send_message(message)
        print(f"Mensagem enviada ({machine_type}): {sensor_data}")
    else:
        print(f"Tipo de máquina desconhecido: {machine_type}")


def main():
    # Cria o cliente do dispositivo
    client = IoTHubDeviceClient.create_from_connection_string(CONNECTION_STRING)

    # Lista de tipos de máquinas
    machine_types = ["lathe_machine", "hydraulic_press", "conveyor_belt"]

    print("Iniciando o envio de dados de sensores...")
    try:
        while True:
            for machine_type in machine_types:
                send_machine_data(client, machine_type)
                time.sleep(2)  # Intervalo entre os envios de diferentes máquinas
            
            # Pausa geral antes do próximo ciclo
            time.sleep(5)
    except Exception as e:
        print(f"Failed with exception {e} while sending message to IOT hub")
    except KeyboardInterrupt:
        print("Encerrando o envio de mensagens...")
    finally:
        client.shutdown()


if __name__ == "__main__":
    main()
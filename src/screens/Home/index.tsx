import { useNavigation } from '@react-navigation/native';
import { CarStatus } from '../../components/CarStatus';
import { HomeHeader } from '../../components/Homeheader';
import { Container, Content, Label, Title } from './styles';
import { useQuery, useRealm } from '../../libs/realm';
import { Historic } from '../../libs/realm/schemas/Historic';
import { useEffect, useState } from 'react';
import { Alert, FlatList } from 'react-native';
import { HistoricCard, HistoricCardProps } from '../../components/historicCard';
import dayjs from 'dayjs';

export function Home() {
  const { navigate } = useNavigation();
  const realm = useRealm();
  const [vehicleInUso, setVehicleInUso] = useState<Historic | null>(null);
  const [vehicleHistoric, setVehicleHistoric] = useState<HistoricCardProps[]>(
    []
  );

  const historic = useQuery(Historic);

  function handleHistoricDetalis(id: string) {
    navigate('arrival', { id });
  }

  function handleRegisterMovement() {
    if (vehicleInUso?._id) {
      navigate('arrival', { id: vehicleInUso._id.toString() });
    } else {
      navigate('derpature');
    }
  }

  function fetchVehicleInUse() {
    try {
      const vehicle = historic.filtered("status = 'departure'")[0];
      setVehicleInUso(vehicle);
    } catch (err) {
      Alert.alert(
        'Veículo em uso',
        'Não foi possivel encontrar o veículo em uso.'
      );
      console.log(err);
    }
  }

  function fetchHistoric() {
    try {
      const response = historic.filtered(
        "status = 'arrival' SORT(created_at DESC)"
      );
      const formattedHistoric = response.map(item => {
        return {
          id: item._id!.toString(),
          licensePlate: item.license_plate,
          isSync: false,
          created: dayjs(item.created_at).format(
            '[Saída em] DD/MM/YYYY [às] HH:mm'
          )
        };
      });
      setVehicleHistoric(formattedHistoric);
    } catch (err) {
      console.error(err);
      Alert.alert('Histórico', 'Não foi possivel buscar o histórico.');
    }
  }

  useEffect(() => {
    fetchVehicleInUse();
    fetchHistoric();
  }, [historic]);
  useEffect(() => {
    realm.addListener('change', () => fetchVehicleInUse());

    return () => {
      if (realm && !realm.isClosed) {
        realm.removeListener('change', () => fetchVehicleInUse());
      }
    };
  }, []);

  return (
    <Container>
      <HomeHeader />
      <Content>
        <CarStatus
          licensePlate={vehicleInUso?.license_plate}
          onPress={handleRegisterMovement}
        />
        <Title>Histórico</Title>
        <FlatList
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
          ListEmptyComponent={<Label>Nenhum veículo utilizado.</Label>}
          data={vehicleHistoric}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <HistoricCard
              onPress={() => handleHistoricDetalis(item.id)}
              data={item}
            />
          )}
        />
      </Content>
    </Container>
  );
}

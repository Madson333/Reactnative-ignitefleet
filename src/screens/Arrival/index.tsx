import { useNavigation, useRoute } from '@react-navigation/native';
import {
  Container,
  Content,
  Description,
  Footer,
  Label,
  LicensePlate
} from './styles';
import { Header } from '../../components/Header';
import { Button } from '../../components/button';
import { ButtonIcon } from '../../components/buttonIcon';
import { X } from 'phosphor-react-native';
import { useObject, useRealm } from '../../libs/realm';
import { Historic } from '../../libs/realm/schemas/Historic';
import { BSON } from 'realm';
import { Alert } from 'react-native';

type RouteParamsProps = {
  id: string;
};

export function Arrival() {
  const route = useRoute();
  const { id } = route.params as RouteParamsProps;

  const historic = useObject(Historic, new BSON.UUID(id) as unknown as string);
  const title = historic?.status === 'departure' ? 'Chegada' : 'Detalhes';
  const realm = useRealm();
  const { goBack } = useNavigation();

  function handleRemoveVehicleUsage() {
    Alert.alert('Cancelar', 'Cancelar a utilização do veículo', [
      { text: 'Não', style: 'cancel' },
      { text: 'Sim', onPress: () => removeVehicleUsage() }
    ]);
  }

  function removeVehicleUsage() {
    realm.write(() => {
      realm.delete(historic);
    });
    goBack();
  }

  function handleArrivalRegister() {
    try {
      if (!historic) {
        return Alert.alert(
          'Error',
          'Não foi possivel encontrar o registro de utilização do veículo.'
        );
      }

      realm.write(() => {
        historic.status = 'arrival';
        historic.updated_at = new Date();
      });

      Alert.alert('Chegada', 'Chegada do veículo registrada com sucesso.');
      goBack();
    } catch (error) {
      console.error(error);
      Alert.alert('Erro', 'Ocorreu um erro ao registrar a chegada.');
    }
  }

  return (
    <Container>
      <Header title={title} />
      <Content>
        <Label>Placa do carro</Label>
        <LicensePlate>{historic?.license_plate}</LicensePlate>

        <Label>Finalidade</Label>
        <Description>{historic?.description}</Description>
      </Content>
      {historic?.status === 'departure' && (
        <Footer>
          <ButtonIcon icon={X} onPress={handleRemoveVehicleUsage} />
          <Button onPress={handleArrivalRegister} title="Registrar chegada" />
        </Footer>
      )}
    </Container>
  );
}

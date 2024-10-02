import { useEffect, useRef, useState } from 'react';
import { Button } from '../../components/button';
import { Header } from '../../components/Header';
import { LicensePlateInput } from '../../components/LicensePlateInput';
import { TextAreaInput } from '../../components/TextAreaInput';
import {
  useForegroundPermissions,
  requestBackgroundPermissionsAsync,
  watchPositionAsync,
  LocationAccuracy,
  LocationSubscription,
  LocationObjectCoords
} from 'expo-location';
import { Container, Content, Message } from './styles';
import {
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert
} from 'react-native';
import { useRealm } from '../../libs/realm';
import { licensePlateValidate } from '../../utils/LicensePlateValidate';
import { getAddressLocation } from '../../utils/getAddressLocation';
import { Historic } from '../../libs/realm/schemas/Historic';
import { useUser } from '@realm/react';
import { useNavigation } from '@react-navigation/native';
import { Loading } from '../../components/Loading';
import { LocationInfo } from '../../components/LocationInfo';
import { Car } from 'phosphor-react-native';
import { Map } from '../../components/Map';
import { startLocationTask } from '../../tasks/backgroundTaskLocation';

const keyboardAvoidingViewBehavior =
  Platform.OS === 'android' ? 'height' : 'position';

export function Derpature() {
  const [description, setDescription] = useState('');
  const [licensePlate, setLicensePlate] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  const [currentAddress, setCurrentAddress] = useState<string | null>(null);
  const [currentCoords, setCurrentCoords] =
    useState<LocationObjectCoords | null>(null);

  const [locationForegroundPermission, requestLocationForegroundPermission] =
    useForegroundPermissions();

  const { goBack } = useNavigation();

  const realm = useRealm();
  const user = useUser();

  const descritionRef = useRef<TextInput>(null);
  const licensePlateRef = useRef<TextInput>(null);

  async function handleDepartureRegister() {
    try {
      if (!licensePlateValidate(licensePlate)) {
        licensePlateRef.current?.focus();
        return Alert.alert(
          'Placa invalida',
          'A placa é invalida, por favor informe a placa correta do veículo.'
        );
      }

      if (description.trim().length === 0) {
        descritionRef.current?.focus();
        return Alert.alert(
          'Finalidade',
          'Por favor, informe a finalidade para utilização do veículo'
        );
      }

      if (!currentCoords?.latitude && !currentCoords?.longitude) {
        return Alert.alert(
          'Localização',
          'Não foi possível encontar a localização atual, tente novamente.'
        );
      }

      setIsRegistering(true);

      const backgroundPermissions = await requestBackgroundPermissionsAsync();

      if (!backgroundPermissions.granted) {
        setIsRegistering(false);
        return Alert.alert(
          'Localização',
          'É necessário permitir que o App tenha acesso em segundo plano. Acesse as configurações e habilite "permitir o tempo todo".'
        );
      }

      startLocationTask();

      realm.write(() => {
        realm.create(
          'Historic',
          Historic.generate({
            user_id: user!.id,
            license_plate: licensePlate.toLocaleUpperCase(),
            description
          })
        );

        Alert.alert('Saída', 'Saída do veículo registrada com sucesso.');
        goBack();
      });
    } catch (err) {
      console.error(err);
      Alert.alert('Erro', 'Ocorreu um erro ao registrar a saída.');
      setIsRegistering(false);
      return;
    }
  }

  useEffect(() => {
    requestLocationForegroundPermission();
  }, []);

  useEffect(() => {
    if (!locationForegroundPermission?.granted) {
      return;
    }

    let subscription: LocationSubscription;

    watchPositionAsync(
      {
        accuracy: LocationAccuracy.High,
        timeInterval: 1000
      },
      location => {
        setCurrentCoords(location.coords);
        getAddressLocation(location.coords)
          .then(address => {
            if (address) {
              setCurrentAddress(address);
            }
          })
          .finally(() => setIsLoadingLocation(false));
      }
    ).then(response => (subscription = response));

    if (subscription!) {
      return () => subscription.remove();
    }
  }, [locationForegroundPermission]);

  if (!locationForegroundPermission?.granted) {
    <Container>
      <Header title="Saída" />
      <Message>
        Você precisa permitir que o aplicativo tenha acesso a localização para
        utilizar essa funcionlidade.
      </Message>
    </Container>;
  }

  if (isLoadingLocation) {
    return <Loading />;
  }

  return (
    <Container>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={keyboardAvoidingViewBehavior}
      >
        <ScrollView>
          <Header title="Saída" />
          {currentCoords && <Map coordinates={[currentCoords]} />}
          <Content>
            {currentAddress && (
              <LocationInfo
                icon={Car}
                label="Localização atual"
                description={currentAddress}
              />
            )}

            <LicensePlateInput
              ref={licensePlateRef}
              label="Placa do veículo"
              placeholder="BRA123"
              onSubmitEditing={() => descritionRef.current?.focus()}
              returnKeyType="next"
              onChangeText={setLicensePlate}
            />
            <TextAreaInput
              ref={descritionRef}
              label="Finalidade"
              onSubmitEditing={handleDepartureRegister}
              returnKeyType="send"
              blurOnSubmit
              onChangeText={setDescription}
            />
            <Button
              title="Registrar Saída"
              isLoading={isRegistering}
              onPress={handleDepartureRegister}
            />
          </Content>
        </ScrollView>
      </KeyboardAvoidingView>
    </Container>
  );
}

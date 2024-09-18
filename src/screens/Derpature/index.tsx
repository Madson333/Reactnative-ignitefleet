import { useRef, useState } from 'react';
import { Button } from '../../components/button';
import { Header } from '../../components/Header';
import { LicensePlateInput } from '../../components/LicensePlateInput';
import { TextAreaInput } from '../../components/TextAreaInput';
import { Container, Content } from './styles';
import {
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert
} from 'react-native';
import { useRealm } from '../../libs/realm';
import { licensePlateValidate } from '../../utils/LicensePlateValidate';
import { Historic } from '../../libs/realm/schemas/Historic';
import { useUser } from '@realm/react';
import { useNavigation } from '@react-navigation/native';

const keyboardAvoidingViewBehavior =
  Platform.OS === 'android' ? 'height' : 'position';

export function Derpature() {
  const [description, setDescription] = useState('');
  const [licensePlate, setLicensePlate] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const { goBack } = useNavigation();

  const realm = useRealm();
  const user = useUser();

  const descritionRef = useRef<TextInput>(null);
  const licensePlateRef = useRef<TextInput>(null);

  function handleDepartureRegister() {
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

      setIsRegistering(true);

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

  return (
    <Container>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={keyboardAvoidingViewBehavior}
      >
        <ScrollView>
          <Header title="Saída" />

          <Content>
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

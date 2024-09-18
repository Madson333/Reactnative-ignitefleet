import { Container, Slogan, Title } from './styles'
import backgroundImg from '../../assets/background.png'
import { Button } from '../../components/button'
import { GoogleSignin } from '@react-native-google-signin/google-signin'
import { Realm, useApp } from '@realm/react'

import { WEB_CLIENT_ID, IOS_CLIENT_ID } from '@env'
import { useState } from 'react'
import { Alert } from 'react-native'

GoogleSignin.configure({
  scopes: ['email', 'profile'],
  webClientId: WEB_CLIENT_ID,
  iosClientId: IOS_CLIENT_ID
})

export function SignIn() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const app = useApp()

  async function handleGoogleSignIn() {
    try {
      setIsAuthenticated(true)
      const { idToken } = await GoogleSignin.signIn()
      if (idToken) {
        const credentials = Realm.Credentials.jwt(idToken)

        await app.logIn(credentials)
      } else {
        Alert.alert('entrar', 'Não foi possivel entrar com o google')
        setIsAuthenticated(false)
      }
    } catch (error) {
      console.log(error)
      setIsAuthenticated(false)
      Alert.alert('entrar', 'Não foi possivel conecta-se na sua conta')
    }
  }

  return (
    <Container source={backgroundImg}>
      <Title>Ignite Fleet</Title>
      <Slogan>Gestão de uso de veículos</Slogan>
      <Button
        title="Entrar com o google"
        isLoading={isAuthenticated}
        onPress={handleGoogleSignIn}
      />
    </Container>
  )
}

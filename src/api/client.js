import { ApolloClient, HttpLink, InMemoryCache } from 'apollo-boost'
import { createAuthLink } from 'aws-appsync'
import fetch from 'node-fetch'

const auth = {
  type: process.env.APP_SYNC_AUTHENTICATION_TYPE,
  apiKey: process.env.APP_SYNC_API_KEY,
  // jwtToken: async () => token,
}

const authLink = createAuthLink({
  url: process.env.APP_SYNC_GRAPHQL_ENDPOINT,
  region: process.env.APP_SYNC_REGION,
  auth,
})

const defaultOptions = {
  watchQuery: {
    fetchPolicy: 'network-only',
    errorPolicy: 'ignore',
  },
  query: {
    fetchPolicy: 'network-only',
    errorPolicy: 'all',
  },
}

const client = new ApolloClient({
  link: authLink.concat(
    new HttpLink({ uri: process.env.APP_SYNC_GRAPHQL_ENDPOINT, fetch })
  ),
  cache: new InMemoryCache(),
  defaultOptions,
})

export default client

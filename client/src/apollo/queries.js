import gql from "graphql-tag";

const ItemFields = gql`
  fragment ItemFields on Item {
    id
    title
    imageurl
    description
    created
    tags {
      id
      title
    }
    itemowner {
      id
      fullname
      email
      bio
    }
    borrower {
      id
      fullname
      email
      bio
    }
  }
`;

export const ITEM_QUERY = gql`
  query item($id: ID!) {
    item(id: $id) {
      ...ItemFields
    }
  }
  ${ItemFields}
`;

export const ALL_ITEMS_QUERY = gql`
  query items($filter: ID) {
    items(filter: $filter) {
      ...ItemFields
    }
  }
  ${ItemFields}
`;

export const ALL_USER_ITEMS_QUERY = gql`
  query user($id: ID!) {
    email
    bio
    fullname
    items {
      ...ItemFields
    }
    borrower {
      ...ItemFields
    }
  }
  ${ItemFields}
`;

export const ALL_TAGS_QUERY = gql`
  query tags {
    tags {
      id
      title
    }
  }
`;

export const ADD_ITEM_MUTATION = gql`
  mutation addItem($item: NewItemInput!) {
  addItem(item: $item, imageurl: $item) {
    id
  }
  }
`;

// /**
//  * Auth-related queries and mutations.
//  */

export const VIEWER_QUERY = gql`
  query {
    viewer {
      id
      email
      fullname
    }
  }
`;
export const LOGOUT_MUTATION = gql`
  mutation {
    logout
  }
`;

export const SIGNUP_MUTATION = gql`
  mutation signup($user: SignupInput!) {
    signup(user: $user) {
      id
    }
  }
`;

export const LOGIN_MUTATION = gql`
  mutation login($user: LoginInput!) {
    login(user: $user) {
      id
    }
  }
`;

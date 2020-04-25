import React, { Component } from 'react';

import { FaGithubAlt, FaPlus, FaSpinner } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { Form, FormValidation, SubmitButton, List } from './styles';
import Container from '../../components/Container';

class Main extends Component {
  state = {
    newRepo: '',
    repositories: [],
    loading: false,
    error: '',
  };

  componentDidMount() {
    const repositories = localStorage.getItem('repositories');

    if (repositories) {
      this.setState({ repositories: JSON.parse(repositories) });
    }
  }

  componentDidUpdate(_, prevState) {
    const { repositories } = this.state;
    if (prevState.repositories !== repositories) {
      localStorage.setItem('repositories', JSON.stringify(repositories));
    }
  }

  handleInputChange = (e) => {
    this.setState({ newRepo: e.target.value });
  };

  handleSubmit = async (e) => {
    e.preventDefault();
    try {
      this.setState({ loading: true, error: '' });
      const { newRepo, repositories } = this.state;

      const { data } = await api.get(`/repos/${newRepo}`);

      const name = data.full_name;
      if (repositories.filter((v) => v.name === name).length > 0) {
        throw new Error('Repositório duplicado.');
      }

      this.setState({
        repositories: [...repositories, { name }],
        newRepo: '',
        loading: false,
      });
    } catch (err) {
      let error = 'Ocorreu um erro inesperado.';
      if (err.message) error = err.message;
      if (err.response && err.response.status === 404) {
        error = 'Repositório não encontrado.';
      }

      this.setState({ loading: false, error, newRepo: '' });
    }
  };

  render() {
    const { newRepo, loading, repositories, error } = this.state;

    return (
      <Container>
        <h1>
          <FaGithubAlt />
          Repositórios
        </h1>

        <Form onSubmit={this.handleSubmit}>
          <FormValidation error={String(error !== '')}>
            <input
              type="text"
              id="input_form"
              placeholder="Adicionar repositório"
              onChange={this.handleInputChange}
              value={newRepo}
            />
            {error !== '' && <label htmlFor="input_form">{error}</label>}
          </FormValidation>

          <SubmitButton loading={String(loading)}>
            {loading ? (
              <FaSpinner color="#FFF" size={14} />
            ) : (
              <FaPlus color="#FFF" size={14} />
            )}
          </SubmitButton>
        </Form>

        <List>
          {repositories.map((repository) => (
            <li key={repository.name}>
              <span>{repository.name}</span>
              <Link to={`/repository/${encodeURIComponent(repository.name)}`}>
                Detalhes
              </Link>
            </li>
          ))}
        </List>
      </Container>
    );
  }
}

export default Main;

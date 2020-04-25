import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import {
  Loading,
  Owner,
  IssuesList,
  OptionsIssues,
  Pagination,
} from './styles';
import Container from '../../components/Container';
import api from '../../services/api';

class Repository extends Component {
  static propTypes = {
    match: PropTypes.shape({
      params: PropTypes.shape({
        repository: PropTypes.string,
      }),
    }).isRequired,
  };

  state = {
    repository: {},
    issues: [],
    loading: true,
    issueState: 'open',
    page: 1,
  };

  async componentDidMount() {
    this.getDetails();
  }

  componentDidUpdate(_, prevState) {
    const { issueState, page } = this.state;
    if (prevState.issueState !== issueState || prevState.page !== page) {
      this.getDetails();
    }
  }

  handleChangeIssue = (e) => {
    this.setState({ issueState: e.target.value, page: 1 });
  };

  handleChangePage = (page) => {
    this.setState({ page });
  };

  getDetails = async () => {
    const { match } = this.props;
    const { issueState, page } = this.state;
    const repoName = decodeURIComponent(match.params.repository);
    const [repository, issues] = await Promise.all([
      api.get(`/repos/${repoName}`),
      api.get(`/repos/${repoName}/issues`, {
        params: {
          state: issueState,
          per_page: 5,
          page,
        },
      }),
    ]);

    this.setState({
      loading: false,
      issues: issues.data,
      repository: repository.data,
    });
  };

  render() {
    const { loading, repository, issues, issueState, page } = this.state;

    if (loading) {
      return <Loading>Carregando</Loading>;
    }

    return (
      <Container>
        <Owner>
          <Link to="/">Voltar aos repositórios</Link>
          <img src={repository.owner.avatar_url} alt={repository.owner.login} />
          <h1>{repository.name}</h1>
          <p>{repository.description}</p>
        </Owner>
        <OptionsIssues>
          <label htmlFor="open">
            <input
              type="radio"
              name="status_issue"
              id="open"
              value="open"
              checked={issueState === 'open'}
              onChange={this.handleChangeIssue}
            />
            Abertas
          </label>

          <label htmlFor="closed">
            <input
              type="radio"
              name="status_issue"
              id="closed"
              value="closed"
              checked={issueState === 'closed'}
              onChange={this.handleChangeIssue}
            />
            fechadas
          </label>

          <label htmlFor="all">
            <input
              type="radio"
              name="status_issue"
              id="all"
              value="all"
              checked={issueState === 'all'}
              onChange={this.handleChangeIssue}
            />
            Todas
          </label>
        </OptionsIssues>
        <IssuesList>
          {issues.map((issue) => (
            <li key={String(issue.id)}>
              <img src={issue.user.avatar_url} alt={issue.user.login} />
              <div>
                <strong>
                  <a href={issue.html_url}>{issue.title}</a>
                  {issue.labels.map((label) => (
                    <span key={String(label.id)}>{label.name}</span>
                  ))}
                </strong>
                <p>{issue.user.login}</p>
              </div>
            </li>
          ))}
        </IssuesList>
        <Pagination>
          <button
            type="button"
            onClick={() => this.handleChangePage(page - 1)}
            disabled={page === 1}
          >
            Anterior
          </button>
          <button
            type="button"
            onClick={() => this.handleChangePage(page + 1)}
            disabled={issues.length === 0}
          >
            Proximo
          </button>
        </Pagination>
      </Container>
    );
  }
}

export default Repository;

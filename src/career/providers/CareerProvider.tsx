import { getCareerOpportunities } from 'career/api';
import { ICareerOpportunity, IEmployment, ILocation, ISelectable } from 'career/models/Career';
import { IApiCompany } from 'core/models/Company';
import React, { Component, createContext } from 'react';

export interface ICareerContextState {
  jobs: ICareerOpportunity[];
  locations: Array<ISelectable<ILocation>>;
  companies: Array<ISelectable<IApiCompany>>;
  jobTypes: Array<ISelectable<IEmployment>>;
  filterText: string;
  toggleLocation: (name: string) => void;
  toggleCompany: (name: string) => void;
  toggleJobType: (name: string) => void;
  handleReset: () => void;
  handleFilterChange: (event: React.FormEvent<HTMLInputElement>) => void;
}

const INITIAL_STATE: ICareerContextState = {
  jobs: [],
  locations: [],
  companies: [],
  jobTypes: [],
  filterText: '',
  toggleLocation: (_: string) => {
    throw new Error('A location was toggled before provider was initialized');
  },
  toggleCompany: (_: string) => {
    throw new Error('A company was toggled before provider was initialized');
  },
  toggleJobType: (_: string) => {
    throw new Error('A jobType was toggled before provider was initialized');
  },
  handleReset: () => {
    throw new Error('A Reset was triggerede before the provider was initialized');
  },
  handleFilterChange: (_: React.FormEvent<HTMLInputElement>) => {
    throw new Error('A filter change was triggerede before the provider was initialized');
  },
};

export const CareerContext = createContext(INITIAL_STATE);

class CareerOpportunities extends Component<{}, ICareerContextState> {
  public state: ICareerContextState = {
    ...INITIAL_STATE,
  };

  public async componentDidMount() {
    const [jobs, companies, jobTypes, locations] = await getCareerOpportunities();
    this.setState({ ...this.state, jobs, companies, jobTypes, locations });
  }

  public toggleLocation = (name: string) => {
    const { locations } = this.state;
    const [old] = locations.filter((loc) => loc.value.name === name);
    const index = locations.indexOf(old);
    locations[index].selected = !locations[index].selected;
    this.setState({ locations });
  };

  public toggleCompany = (name: string) => {
    const { companies } = this.state;
    const [old] = companies.filter((company) => company.value.name === name);
    const index = companies.indexOf(old);
    companies[index].selected = !companies[index].selected;
    this.setState({ companies });
  };

  public toggleJobType = (name: string) => {
    const { jobTypes } = this.state;
    const [old] = jobTypes.filter((loc) => loc.value.name === name);
    const index = jobTypes.indexOf(old);
    jobTypes[index].selected = !jobTypes[index].selected;
    this.setState({ jobTypes });
  };

  public handleFilterChange = (event: React.FormEvent<HTMLInputElement>) => {
    if (event.target) {
      this.setState({
        filterText: event.currentTarget.value,
      });
    }
  };

  /** Reset will be done by fetching initial state from API again */
  public handleReset = () => {
    this.componentDidMount();
    this.setState({ filterText: '' });
  };

  public render() {
    const jobs = this.filterJobs();
    const { handleFilterChange, handleReset, toggleCompany, toggleJobType, toggleLocation } = this;
    const value = {
      ...this.state,
      handleFilterChange,
      handleReset,
      toggleCompany,
      toggleJobType,
      toggleLocation,
      jobs,
    };
    return <CareerContext.Provider value={value}>{this.props.children}</CareerContext.Provider>;
  }

  private filterJobs(): ICareerOpportunity[] {
    const { jobs, locations, companies, jobTypes, filterText } = this.state;
    let filteredJobs: ICareerOpportunity[] = jobs;
    if (filterText !== '') {
      filteredJobs = filteredJobs.filter((job) => {
        const filterables = [job.title, job.ingress, job.description, job.company.name];
        return filterables.some((text) => text.toLocaleLowerCase().includes(filterText.toLocaleLowerCase()));
      });
    }
    if (companies.some((company) => company.selected)) {
      const filterCompanies = companies.filter((company) => company.selected).map((selectable) => selectable.value);
      filteredJobs = filteredJobs.filter((job) => filterCompanies.includes(job.company));
    }
    if (jobTypes.some((employment) => employment.selected)) {
      const filterJobTypes = jobTypes.filter((employment) => employment.selected).map((selectable) => selectable.value);
      filteredJobs = filteredJobs.filter((job) => filterJobTypes.includes(job.employment));
    }
    if (locations.some((location) => location.selected)) {
      const filterLocations = locations.filter((location) => location.selected).map((selectable) => selectable.value);
      filteredJobs = filteredJobs.filter((job) => job.location.some((loc) => filterLocations.includes(loc)));
    }
    return filteredJobs;
  }
}

export default CareerOpportunities;

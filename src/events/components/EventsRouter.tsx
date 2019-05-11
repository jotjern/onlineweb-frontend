import HttpError from 'core/components/errors/HttpError';
import { Route } from 'core/components/Router';
import React from 'react';
import { Switch } from 'react-router-dom';
import DetailView from './DetailView';
import Events from './Events';

export const routes = {
  root: '/events',
  detail: '/events/:id',
};

const EventsRouter = ({}) => (
  <Switch>
    <Route exact path={routes.root} component={Events} />
    <Route path={routes.detail} render={({ match }) => <DetailView eventId={match.params.id} />} />
    <Route path="*" render={() => <HttpError code={404} />} />
  </Switch>
);

export default EventsRouter;

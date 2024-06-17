import { IonApp, IonRouterOutlet, IonSplitPane, setupIonicReact, useIonToast } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { Redirect, Route, useHistory } from 'react-router-dom';
import Menu from './components/Menu';
import Page from './pages/Page';
import ProfileForm from './pages/ProfileForm';
import ProfilePage from './pages/ProfilePage';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/**
 * Ionic Dark Mode
 * -----------------------------------------------------
 * For more info, please see:
 * https://ionicframework.com/docs/theming/dark-mode
 */

/* import '@ionic/react/css/palettes/dark.always.css'; */
/* import '@ionic/react/css/palettes/dark.class.css'; */
import '@ionic/react/css/palettes/dark.system.css';

/* Theme variables */
import './theme/variables.css';
import RecetaBcData from './service/RecetaBcData';
import RecetaNew from './pages/RecetaNew';
import { useEffect } from 'react';
import RecetaSuscriberElement from './components/RecetaSuscriberElement';
import RecetaView from './pages/RecetaView';

setupIonicReact();

const App: React.FC = () => {
  /** Fuerzo la lectura */
  const data = RecetaBcData.getInstance();
  data.getProfiles().then((p) => {
    // do nothing
  });

  return (
    <IonApp>
      <IonReactRouter>
        <IonSplitPane contentId="main">
          <Menu />
          <RecetaSuscriberElement />
          <IonRouterOutlet id="main">
            <Route path="/" exact={true}>
              <Redirect to="/folder/Inbox" />
            </Route>
            <Route path="/folder/:name" exact={true}>
              <Page />
            </Route>
            <Route path="/profile/new" exact={true}>
              <ProfileForm />
            </Route>
            <Route path="/profile" exact={true}>
              <ProfilePage />
            </Route>
            <Route path="/receta/new" exact={true}>
              <RecetaNew />
            </Route>
            <Route path="/receta/:id" exact={true}>
              <RecetaView />
            </Route>
          </IonRouterOutlet>
        </IonSplitPane>
      </IonReactRouter>
    </IonApp>
  );
};

export default App;

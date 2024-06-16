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

setupIonicReact();

const App: React.FC = () => {
  /** Fuerzo la lectura */
  const data = RecetaBcData.getInstance();
  data.getProfiles().then((p) => {
    // do nothing
  });

  const [presentToast, dismissToast] = useIonToast()
  const history = useHistory();

  useEffect(() => {
      const suscriptor = data.observeRecetas().subscribe((receta) => {
          const profile = data.getCurrentProfile();
          if (!profile) {
              return;
          }
          if (receta.didPaciente !== profile.didId) {
              console.log("Receta no es para mi", receta.didPaciente, profile.didId)
              return
          }
          presentToast({
              message: '¡Receta recibida!',
              color: 'success',
              duration: 2000,
              buttons: [
                  {
                      text: 'Ver',
                      handler: () => {
                          dismissToast();
                          history.push('/folder/Inbox');
                      }
                  }
              ]
          })
      })

      return () => {
          suscriptor.unsubscribe();
      }
  }, [data]);

  return (
    <IonApp>
      <IonReactRouter>
        <IonSplitPane contentId="main">
          <Menu />
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
          </IonRouterOutlet>
        </IonSplitPane>
      </IonReactRouter>
    </IonApp>
  );
};

export default App;

import { IonApp, IonPage, IonRouterOutlet, IonSplitPane, setupIonicReact, useIonToast } from '@ionic/react';
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
// import '@ionic/react/css/palettes/dark.system.css';

/* Theme variables */
import './theme/variables.css';
import RecetaBcData from './service/RecetaBcData';
import RecetaNew from './pages/RecetaNew';
import RecetaSuscriberElement from './components/RecetaSuscriberElement';
import RecetaView from './pages/RecetaView';
import RecetaDispensa from './pages/RecetaDispensa';
import PacienteList from './pages/PacienteList';
import CreateUser from './pages/CreateUser';
import ChooseRole from './pages/ChooseRole';
import Header from './components/Header';
import Footer from './components/Footer';
import NewReceipt from './pages/NewReceipt';
import Receipts from './pages/Receipts';
import ReceiptDetails from './pages/ReceiptDetails';

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
            <IonPage>
              <Header />
              <Route path="/" exact={true}>
                <ChooseRole />
              </Route>
              <Route path="/init" exact={true}>
                <CreateUser />
              </Route>
              <Route path="/new_receipt" exact={true}>
                <NewReceipt />
              </Route>
              <Route path="/receipt" exact={true}>
                <ReceiptDetails />
              </Route>
              <Route path="/receipts" >
                <Receipts />
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
              <Route path="/receta/:id" exact={true}>
                <RecetaView />
              </Route>
              <Route path="/receta/new" exact={true}>
                <RecetaNew />
              </Route>
              <Route path="/receta/new/:paciente" exact={true}>
                <RecetaNew />
              </Route>
              <Route path="/pacientes" exact={true}>
                <PacienteList />
              </Route>
              <Route path="/dispensa/:id" exact={true}>
                <RecetaDispensa />
              </Route>
              <Footer />
            </IonPage>
          </IonRouterOutlet>
        </IonSplitPane>
      </IonReactRouter>
    </IonApp>
  );
};

export default App;
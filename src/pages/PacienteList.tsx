import { useEffect, useState } from "react";
import Profile from "../model/Profile";
import RecetaBcData from "../service/RecetaBcData";
import PacienteProvider, { Paciente } from "../receta/PacienteProvider";
import ProfileHandler from "../service/ProfileHandler";
import { IonPage, IonHeader, IonToolbar, IonButtons, IonMenuButton, IonTitle, IonContent, IonList, IonItem, IonLabel, IonNote, IonBadge, IonButton, IonIcon } from "@ionic/react";
import FinanciadorProvider from "../service/FinanciadorProvider";
import { addCircle } from "ionicons/icons";

const PacienteList: React.FC = () => {
    const data = RecetaBcData.getInstance();
    const pacienteProvider = PacienteProvider.getInstance();
    const [currentProfile, setCurrentProfile] = useState<Profile|null>(null);
    const [pacientes, setPacientes] = useState<Paciente[]>([]);
    
    useEffect(() => {
        setCurrentProfile(data.getCurrentProfile());
        const s = data.observeProfile().subscribe((p) => {
            setCurrentProfile(p);
        })
    
        return () => {
            s.unsubscribe()
        }
      }, [])


    useEffect(() => {
        console.log("PacienteList: currentProfile", currentProfile, currentProfile? ProfileHandler.isMedico(currentProfile) : '');
        if (currentProfile && ProfileHandler.isMedico(currentProfile)) {
            pacienteProvider.getPacientes().then((p) => {
                setPacientes(p);
            })
        } else {
            setPacientes([]);
        }
    }, [currentProfile])

    return <IonPage>
        <IonHeader>
            <IonToolbar>
                <IonButtons slot="start">
                <IonMenuButton />
                </IonButtons>
                <IonTitle>Pacientes</IonTitle>
            </IonToolbar>
        </IonHeader>

        <IonContent fullscreen>
            <IonHeader collapse="condense">
                <IonToolbar>
                    <IonTitle size="large">Pacientes</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonList>
                {pacientes.map((p) => {
                    return <IonItem key={p.did}>
                        <IonLabel>
                            {p.nombre}
                            {p.financiador? <p>Financiador: {p.financiadorNombre}</p>: ''}
                            <p>Recetas: {p.cantidadRecetas} {p.lastReceta ? <>Última receta: {p.lastReceta.toLocaleDateString()}</>: ''}</p>
                        </IonLabel>
                        <IonButton slot="end" routerLink={"/receta/new/"+p.did}>
                            <IonIcon slot="icon-only" icon={addCircle}></IonIcon>
                        </IonButton>
                    </IonItem>
                })}
            </IonList>
        </IonContent>
    </IonPage>


}

export default PacienteList;
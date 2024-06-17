import { useIonToast } from "@ionic/react";
import { useEffect } from "react";
import { useHistory } from "react-router";
import RecetaBcData from "../service/RecetaBcData";


const RecetaSuscriberElement: React.FC = () => { 
    const [presentToast, dismissToast] = useIonToast()
    const history = useHistory();
    const data = RecetaBcData.getInstance();


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

    return (<></>)
}

export default RecetaSuscriberElement;
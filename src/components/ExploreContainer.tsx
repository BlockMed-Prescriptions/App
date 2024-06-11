import { IonCard, IonCardHeader, IonList } from '@ionic/react';
import './ExploreContainer.css';
import { useEffect, useState } from 'react';
import Receta from '../model/Receta';
import RecetaBcData, { RECETA_FOLDER_ARCHIVED, RECETA_FOLDER_FAVORITOS, RECETA_FOLDER_INBOX, RECETA_FOLDER_OUTBOX, RECETA_FOLDER_PAPELERA } from '../service/RecetaBcData';
import RecetaCard from './RecetaCard';

interface ContainerProps {
    name: string;
}

const FolderConversion: { [key: string]: string } = {
    "Outbox": RECETA_FOLDER_OUTBOX,
    "Inbox": RECETA_FOLDER_INBOX,
    "Trash": RECETA_FOLDER_PAPELERA,
    "Archived": RECETA_FOLDER_ARCHIVED,
    "Favorites": RECETA_FOLDER_FAVORITOS
}

const ExploreContainer: React.FC<ContainerProps> = ({ name }) => {

    const data = RecetaBcData.getInstance();
    const recetaFolder = FolderConversion[name];
    if (!recetaFolder) {
        throw new Error(`Folder ${name}. not found`);
    }

    const [recetas, setRecetas] = useState<Receta[]>([]);

    const refreshRecetas = () => {
        data.getRecetasFromFolder(recetaFolder).then((recetas) => {
            setRecetas(recetas);
        });
    }

    useEffect(() => {
        setTimeout(() => {
            refreshRecetas();
        })

        const suscriptor = data.observeFolders().subscribe((folder) => {
            if (folder === recetaFolder) {
                console.log('folder', folder);
                refreshRecetas();
            }
        });

        return () => {
            suscriptor.unsubscribe();
        }
    });

    return (
        <IonList>
            {recetas.map((receta) => (
                RecetaCard({ receta })
            ))}
      </IonList>
    );
};

export default ExploreContainer;

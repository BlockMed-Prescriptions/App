import { IonList } from '@ionic/react';
import './ExploreContainer.css';
import Receta from '../model/Receta';
import RecetaCard from './RecetaCard';

interface ContainerProps {
    name: string;
    recetas: Receta[]
}

const ExploreContainer: React.FC<ContainerProps> = ({ name, recetas }) => {
    return (
        <>
            {recetas.map((receta) => (
                RecetaCard({ receta })
            ))}
        </>
    );
};

export default ExploreContainer;

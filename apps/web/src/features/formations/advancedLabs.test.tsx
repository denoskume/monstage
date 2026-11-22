import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AdvancedImageLab } from './AdvancedImageLabs';
import { DataWorkbench } from './DataWorkbench';
import { ImageWorkbench } from './ImageWorkbench';

describe('Real learning visualizations',()=>{
  it('shows Fourier signal and DFT amplitude on labeled plots',async()=>{
    const user=userEvent.setup();
    render(<AdvancedImageLab moduleId="fourier"/>);
    expect(screen.getByRole('img',{name:'Profil spatial 1D'})).toBeInTheDocument();
    expect(screen.getByRole('img',{name:'Module de la DFT'})).toBeInTheDocument();
    expect(screen.getByText(/Le pic principal se déplace/)).toBeInTheDocument();
    await user.keyboard('{Tab}');
  });
  it('shows camera frame and reference difference for movement',()=>{
    render(<AdvancedImageLab moduleId="video-mouvement"/>);
    expect(screen.getByRole('img',{name:/Objet à la position/})).toBeInTheDocument();
    expect(screen.getByRole('img',{name:'Masque de différence avec le fond'})).toBeInTheDocument();
  });
  it('shows real CSV rows, quality controls and a continuous plot',()=>{
    render(<DataWorkbench/>);
    expect(screen.getByRole('img',{name:/Courbe de Ventes sur 6 observations/})).toBeInTheDocument();
    expect(screen.getByText('Doublons exacts')).toBeInTheDocument();
    expect(screen.getByRole('table')).toBeInTheDocument();
  });
  it('shows original, processed image and labeled histogram',()=>{
    render(<ImageWorkbench moduleId="segmentation"/>);
    expect(screen.getByRole('img',{name:'Image originale en niveaux de gris'})).toBeInTheDocument();
    expect(screen.getByRole('img',{name:/Histogramme du résultat/})).toBeInTheDocument();
  });
});

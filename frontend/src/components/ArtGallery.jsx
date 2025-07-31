import React from 'react';

// --- Sub-componente para la Tarjeta de Arte ---
const ArtCard = ({ art }) => {
    return (
        <div className="bg-mediumblue rounded-xl shadow-lg overflow-hidden card-hover-effect flex flex-col h-full border border-gray-700">
            <a href={`/obras/${art.id}`} className="block"> {/* <-- ENLACE A LA PÁGINA DE DETALLE DE LA OBRA */}
                <img 
                    className="w-full h-56 object-cover" 
                    src={art.imagen_url} // Usamos el nombre de campo correcto de la DB
                    alt={`Obra de arte titulada ${art.titulo}`} 
                    onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/600x400/1f2937/9ca3af?text=Imagen+no+disponible'; }}
                />
            </a>
            <div className="p-6 flex-grow flex flex-col">
                <h3 className="text-xl font-bold text-white mb-2">{art.titulo}</h3>
                <p className="text-md font-semibold text-indigo-400 mb-3">
                    por <a href={`/artistas/${art.artista_id}`} className="hover:underline">{art.full_name}</a>
                </p>
                <p className="text-gray-400 text-sm line-clamp-3 flex-grow">{art.descripcion}</p>
            </div>
        </div>
    );
};

// --- Componente Principal de la Galería Pública ---
const ArtGallery = ({ artworks }) => {
    if (!artworks || artworks.length === 0) {
        return (
            <div className="text-center py-10">
                <p className="text-lg text-gray-400">No hay obras destacadas en este momento.</p>
            </div>
        );
    }

    // --- Renderizado de la Galería ---
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {artworks.map(art => <ArtCard key={art.id} art={art} />)}
        </div>
    );
};

export default ArtGallery;

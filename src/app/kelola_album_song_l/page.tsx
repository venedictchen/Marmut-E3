"use client"
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { fetchAlbums, deleteAlbum } from "../actions/kelolaAlbumL";
import { useAuth } from "../contexts/AuthContext";

interface Album {
    id: string;
    judul: string;
    jumlahLagu: number;
    totalDurasi: number;
}

const kelola_album_l: React.FC = () => {
    const [albums, setAlbums] = useState<Album[]>([]);
    const router = useRouter();
    const { idLabel , isAuthenticated , role } = useAuth();
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        if (idLabel) {
            const loadData = async () => {
                try {
                    const fetchedAlbums = await fetchAlbums(idLabel);
                    setAlbums(fetchedAlbums);
                } catch (err) {
                    console.error("Failed to fetch data:", err);
                    toast.error("Failed to load data");
                }
            };
    
            loadData();
        }

    }, [idLabel]);

    useEffect(() => {
        setIsLoaded(true);
    }, []);

    useEffect(() => {
        if (isLoaded && !isAuthenticated) {
            router.push("auth/login");
        }
    }, [isAuthenticated, isLoaded]);

    const handleDelete = async (judul: string) => {
        try {
            await deleteAlbum(judul);
            toast.success("Song deleted");
            setAlbums(albums.filter(album => album.judul !== judul));
            router.back();
        } catch (error) {
            console.error("Failed to delete album:", error);
            toast.error("Failed to delete album");
        }
    }

    if (!isAuthenticated || !role.includes('label')) {
        return <p>Access Denied</p>;
    }

    return (
        <div className="flex min-h-screen bg-white flex-col items-center gap-16 font-bold p-48">
            <h1 className="text-3xl">List Album</h1>
            <table className="table-fixed w-full">
                <thead>
                    <tr>
                        <th className="w-1/4 px-4 py-2">Judul</th>
                        <th className="w-1/4 px-4 py-2">Jumlah Lagu</th>
                        <th className="w-1/4 px-4 py-2">Total Durasi</th>
                        <th className="w-1/4 px-4 py-2">Action</th>
                    </tr>
                </thead>
                <tbody>
                    {albums.map((album, index) => (
                        <tr key={index}>
                            <td className="border px-4 py-2">{album.judul}</td>
                            <td className="border px-4 py-2">{album.jumlahLagu}</td>
                            <td className="border px-4 py-2">{album.totalDurasi}</td>
                            <td className="border px-4 py-2">
                                <button onClick={() => router.push(`/kelola_album_song_as/daftar_lagu/${album.id}`)} className="bg-blue-500 hover:bg-blue-700 text-white py-1 px-2 rounded">Lihat Daftar Lagu</button>
                                <button onClick={() => handleDelete(album.id)} className="bg-red-500 hover:bg-red-700 text-white py-1 px-2 rounded ml-2">Hapus</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default kelola_album_l;
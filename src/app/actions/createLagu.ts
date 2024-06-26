"use server"
import { sql } from "@vercel/postgres";
import { v4 as uuidv4 } from 'uuid';

export async function fetchArtist(): Promise<string[]> {
    const results = await sql`SELECT K.nama FROM AKUN K, ARTIST R WHERE R.email_akun = K.email`;
    return results.rows.map(row => row.nama as string);
}

export async function fetchSongwriter(): Promise<string[]> {
    const results = await sql`SELECT A.nama FROM AKUN A, SONGWRITER S WHERE S.email_akun = A.email`;
    return results.rows.map(row => row.nama as string);
}

export async function fetchGenre(): Promise<string[]> {
    const results = await sql`SELECT DISTINCT genre FROM GENRE`;
    return results.rows.map(row => row.genre as string);
}

export async function fetchAlbumName(idAlbum: string): Promise<string[]> {
    const results = await sql`SELECT judul FROM ALBUM WHERE id = ${idAlbum}`;
    return results.rows.map(row => row.judul as string);
}

async function getArtistIdByName(artistName: string): Promise<string> {
    const result = await sql`
        SELECT id
        FROM ARTIST
        WHERE email_akun IN(
            SELECT email
            FROM AKUN
            WHERE nama = ${artistName}
        )`;
    
    if (result.rowCount === 0) {
        throw new Error(`Artist "${artistName}" not found.`);
    }
    return result.rows[0].id as string;

}

async function getSongwriterIdByName(songwriterName: string): Promise<string> {
    const result = await sql`
        SELECT id
        FROM SONGWRITER
        WHERE email_akun IN(
            SELECT email
            FROM AKUN
            WHERE nama = ${songwriterName}
        )`;
    
    if (result.rowCount === 0) {
        throw new Error(`Artist "${songwriterName}" not found.`);
    }
    return result.rows[0].id as string;

}

export async function getArtistNameByEmail(email: string) {
    const results= await sql`SELECT nama FROM AKUN WHERE email = ${email}`;
    return results.rows.map(row => row.nama as string);
}

export async function createLagu(formData: FormData) {
    const judulLagu = formData.get('judulLagu') as string;
    const artistName = formData.get('artist') as string;
    const artistId = await getArtistIdByName(artistName);
    if (!artistId) {
        throw new Error("Artist not Found.");
    }

    const idAlbum = formData.get('idAlbum') as string;

    const songwriters = JSON.parse(formData.get('songwriters') as string);
    const genres = JSON.parse(formData.get('genres') as string);
    const durasi = formData.get('durasi') as string;

    const newKontenId = uuidv4();
    const tanggalRilis = new Date();
    const tanggalRilisString = tanggalRilis.toISOString();
    const tahunRilis = tanggalRilis.getFullYear();

    try {
        await sql`
            INSERT INTO KONTEN 
            VALUES (
               ${newKontenId},
               ${judulLagu},
               ${tanggalRilisString},
               ${tahunRilis},
               ${durasi} 
            )
        `;

        await sql`
        INSERT INTO SONG (
            id_konten,
            id_artist,
            id_album
        ) VALUES (
            ${newKontenId},
            ${artistId},
            ${idAlbum}
        )
    `;
    
    for (const songwriter of songwriters) {
        const songwriterId = await getSongwriterIdByName(songwriter);
        await sql`
        INSERT INTO SONGWRITER_WRITE_SONG 
        VALUES (
            ${songwriterId},
            ${newKontenId}
        )
    `;
    }

    for (const genre of genres) {
        await sql`
        INSERT INTO GENRE 
        VALUES (
            ${newKontenId},
            ${genre}
        )
    `;
    }

    } catch (err: any) {
        console.error("Failed to create album and song:", err);
        throw err;
    }
}
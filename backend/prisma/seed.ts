import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/utils/passwordUtils.js';

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando seed do banco de dados...');

  const adminEmail = 'eliasaparecido@hotmail.com.br';
  const adminPassword = 'cifras321';

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      name: 'Elias Aparecido',
      isAdmin: true,
      passwordHash: hashPassword(adminPassword),
    },
    create: {
      name: 'Elias Aparecido',
      email: adminEmail,
      passwordHash: hashPassword(adminPassword),
      isAdmin: true,
    },
  });

  await prisma.playlistSong.deleteMany();
  await prisma.song.deleteMany();
  await prisma.playlist.deleteMany();

  const song1 = await prisma.song.create({
    data: {
      title: 'Amazing Grace',
      artist: 'John Newton',
      originalKey: 'G',
      lyrics: `[G]Amazing [C]grace, how [G]sweet the [D]sound\n[G]That saved a [C]wretch like [G]me\n[G]I once was [C]lost, but [G]now am [D]found\nWas [G]blind but [C]now I [G]see`,
      isPublic: true,
      ownerId: admin.id,
    },
  });

  const song2 = await prisma.song.create({
    data: {
      title: 'Eu Navegarei',
      artist: 'Vineyard',
      originalKey: 'D',
      lyrics: `[D]Eu navegarei no [A]oceano do Espirito\nE [Bm]ali adorarei ao [F#m]Deus do meu a[G]mor`,
      isPublic: true,
      ownerId: admin.id,
    },
  });

  const song3 = await prisma.song.create({
    data: {
      title: 'Quao Grande Es Tu',
      artist: 'Tradicional',
      originalKey: 'C',
      lyrics: `[C]Senhor meu [Am]Deus, quando eu ma[C]ravilhado`,
      isPublic: true,
      ownerId: admin.id,
    },
  });

  const playlist = await prisma.playlist.create({
    data: {
      name: 'Missa de Domingo - Exemplo',
      description: 'Playlist de exemplo com musicas transpostas',
      isPublic: false,
      ownerId: admin.id,
      songs: {
        create: [
          { songId: song1.id, key: 'C', order: 0 },
          { songId: song2.id, key: 'D', order: 1 },
          { songId: song3.id, key: 'G', order: 2 },
        ],
      },
    },
    include: {
      songs: {
        include: { song: true },
      },
    },
  });

  await prisma.song.updateMany({ data: { isPublic: true } });
  await prisma.playlist.updateMany({ data: { isPublic: false, ownerId: admin.id } });

  console.log('Admin configurado:', admin.email);
  console.log('Playlist criada:', playlist.name, 'com', playlist.songs.length, 'musicas');
  console.log('Seed concluido com sucesso!');
}

main()
  .catch((e) => {
    console.error('Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

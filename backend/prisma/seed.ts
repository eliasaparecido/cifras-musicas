import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // Limpar dados existentes
  await prisma.playlistSong.deleteMany();
  await prisma.song.deleteMany();
  await prisma.playlist.deleteMany();

  // Criar músicas de exemplo
  const song1 = await prisma.song.create({
    data: {
      title: 'Amazing Grace',
      artist: 'John Newton',
      originalKey: 'G',
      lyrics: `[G]Amazing [C]grace, how [G]sweet the [D]sound
[G]That saved a [C]wretch like [G]me
[G]I once was [C]lost, but [G]now am [D]found
Was [G]blind but [C]now I [G]see

[G]'Twas grace that [C]taught my [G]heart to [D]fear
And [G]grace my [C]fears re[G]lieved
[G]How precious [C]did that [G]grace ap[D]pear
The [G]hour I [C]first be[G]lieved`,
    },
  });

  const song2 = await prisma.song.create({
    data: {
      title: 'Eu Navegarei',
      artist: 'Vineyard',
      originalKey: 'D',
      lyrics: `[D]Eu navegarei no [A]oceano do Espírito
E [Bm]ali adorarei ao [F#m]Deus do meu a[G]mor
[D]Espírito, [A]Espírito que [G]desce sobre [D]mim
E [G]me leva aos [D]céus, [A]me faz ado[D]rar

[D]Eu adorarei ao [A]Deus da minha vida
Que [Bm]me compreendeu sem [F#m]nenhuma expli[G]cação
[D]É tão bom te a[A]dorar, tua [G]glória contem[D]plar
[G]Te olhar, [D]teu amor me [A]faz canti[D]car`,
    },
  });

  const song3 = await prisma.song.create({
    data: {
      title: 'Quão Grande És Tu',
      artist: 'Tradicional',
      originalKey: 'C',
      lyrics: `[C]Senhor meu [Am]Deus, quando eu ma[C]ravilhado
[F]Fico a pen[C]sar nas obras de Tuas [G]mãos
O [C]céu azul, as [Am]nuvens com es[C]plendor
O [F]som do [C]mar, a terra e os [G]campos em [C]flor

[C]Minha alma [Am]canta en[F]tão a [C]Ti, Senhor
[C]Quão grande [G]és Tu! [C]Quão grande [G7]és Tu!
[C]Minha alma [Am]canta en[F]tão a [C]Ti, Senhor
[C]Quão grande [G]és Tu! [C]Quão grande [G]és [C]Tu!`,
    },
  });

  console.log('✅ Músicas criadas:', song1.title, song2.title, song3.title);

  // Criar playlist de exemplo
  const playlist = await prisma.playlist.create({
    data: {
      name: 'Missa de Domingo - Exemplo',
      description: 'Playlist de exemplo com músicas transpostas',
      songs: {
        create: [
          {
            songId: song1.id,
            key: 'C', // Transposta de G para C
            order: 0,
          },
          {
            songId: song2.id,
            key: 'D', // Mantém tom original
            order: 1,
          },
          {
            songId: song3.id,
            key: 'G', // Transposta de C para G
            order: 2,
          },
        ],
      },
    },
    include: {
      songs: {
        include: {
          song: true,
        },
      },
    },
  });

  console.log('✅ Playlist criada:', playlist.name, 'com', playlist.songs.length, 'músicas');

  console.log('\n🎉 Seed concluído com sucesso!');
  console.log(`   ${await prisma.song.count()} músicas`);
  console.log(`   ${await prisma.playlist.count()} playlist`);
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

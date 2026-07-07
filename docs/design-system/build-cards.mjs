// Generates the Claude Design preview-card bundle for the Patas Arriba design
// system from the single v6 theme. Each emitted HTML file is a SELF-CONTAINED
// card (React + MUI + the shared theme inlined) whose first line is the
// `@dsCard` marker the Design System pane indexes. One card = one component
// group. Run: `node docs/design-system/build-cards.mjs` — writes ./cards/*.html.
//
// Why a generator instead of hand-authored files: the theme is defined ONCE
// here and stamped into every card, so the cards can never drift from each
// other or from docs/design-tokens-issue-14.md the way copy-pasted files would.

import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const outDir = join(dirname(fileURLToPath(import.meta.url)), 'cards');
mkdirSync(outDir, { recursive: true });

// ── The shared theme, verbatim from docs/mockup/v6-mui-light.html ────────────
const THEME = `
const SURFACE={subtle:'#F5F5F2',muted:'#F0F0EC',line:'#E8E8E4'};
const BRAND={coral:'#EA5347',coralDeep:'#E23125',amber:'#EFB666',amberDeep:'#D99946',teal:'#98D2CD',tealDeep:'#3E9B95',pink:'#FFB3B9',pinkDeep:'#E06B8D',black:'#1A1A1A'};
const CATEGORY={protectora:{main:'#3E9B95',contrastText:'#FFFFFF'},mercadillo:{main:'#E8850C',contrastText:'#212121'},recogida:{main:'#8E7CC3',contrastText:'#FFFFFF'},otro:{main:'#7A8691',contrastText:'#FFFFFF'},plataforma:{main:'#5B8DEF',contrastText:'#FFFFFF'},rol:{main:'#95A5A6',contrastText:'#212121'},evento:{main:'#EA5347',contrastText:'#FFFFFF'},refugio:{main:'#E06B8D',contrastText:'#FFFFFF'}};
const AVATAR_COLORS=['#EA5347','#D99946','#3E9B95','#E06B8D','#8E7CC3','#E8850C','#5B8DEF','#98D2CD'];
const avatarColorFor=(seed='')=>AVATAR_COLORS[[...String(seed)].reduce((h,c)=>(h*31+c.charCodeAt(0))>>>0,7)%AVATAR_COLORS.length];
const DISPLAY_FONT="'Staatliches','Roboto',sans-serif";
const theme=createTheme({palette:{mode:'light',
  primary:{main:BRAND.coral,light:'#F4837A',dark:'#C13A2E',contrastText:'#FFFFFF'},
  secondary:{main:BRAND.amber,light:BRAND.amberDeep,dark:'#C9882F',contrastText:'#212121'},
  error:{main:'#C62828',contrastText:'#FFFFFF'},warning:{main:'#E8850C',contrastText:'#212121'},
  success:{main:'#2E7D46',contrastText:'#FFFFFF'},info:{main:'#147A70',contrastText:'#FFFFFF'},
  background:{default:'#FAFAF8',paper:'#FFFFFF'},text:{primary:'#2E2E2E',secondary:'#6B7078'},
  divider:SURFACE.line,surface:SURFACE,brand:BRAND,category:CATEGORY,avatar:AVATAR_COLORS},
 typography:{fontFamily:"'Roboto',-apple-system,sans-serif",
  h1:{fontFamily:DISPLAY_FONT,fontSize:'clamp(1.9rem,6vw,2.35rem)',fontWeight:400,letterSpacing:'0.5px',lineHeight:1.05,color:'#2E2E2E'},
  h2:{fontFamily:DISPLAY_FONT,fontSize:'clamp(1.5rem,5vw,1.8rem)',fontWeight:400,letterSpacing:'0.4px',lineHeight:1.1,color:'#2E2E2E'},
  h3:{fontSize:'1.2rem',fontWeight:700,color:'#2E2E2E'},h4:{fontSize:'1.0625rem',fontWeight:700,color:'#2E2E2E'},
  h5:{fontSize:'1rem',fontWeight:600,color:'#2E2E2E'},h6:{fontSize:'0.9375rem',fontWeight:600,color:'#2E2E2E'},
  button:{textTransform:'none',fontWeight:600}},
 shape:{borderRadius:12},
 components:{MuiButton:{styleOverrides:{root:{minHeight:48,borderRadius:10,padding:'12px 20px'}}},
  MuiIconButton:{styleOverrides:{root:{minWidth:44,minHeight:44}}},
  MuiCard:{styleOverrides:{root:{borderRadius:16,backgroundImage:'none',boxShadow:'0 1px 3px rgba(26,26,26,0.06), 0 1px 2px rgba(26,26,26,0.04)'}}},
  MuiChip:{styleOverrides:{root:{fontWeight:600,borderRadius:20}}},
  MuiTextField:{styleOverrides:{root:{'& .MuiOutlinedInput-root':{borderRadius:10}}}}}});
const MI=({name,sx})=><span className="material-icons-round" style={{fontSize:20,...sx}}>{name}</span>;`;

// ── Card harness ─────────────────────────────────────────────────────────────
const page = ({ group, title, body, helpers = '' }) => `<!-- @dsCard group="${group}" -->
<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>${title}</title>
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
<link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&family=Staatliches&display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/icon?family=Material+Icons+Round" rel="stylesheet"/>
<script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
<script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
<script crossorigin src="https://unpkg.com/@mui/material@5.17.1/umd/material-ui.production.min.js"></script>
<script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
<style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:'Roboto',sans-serif;background:#FAFAF8}</style>
</head><body><div id="root"></div>
<script type="text/babel">
const {ThemeProvider,createTheme,CssBaseline,Box,Stack,Typography,Button,IconButton,TextField,MenuItem,InputAdornment,Card,CardContent,Chip,Avatar,Divider,Paper,BottomNavigation,BottomNavigationAction,List,ListItemButton,ListItemAvatar,ListItemText}=MaterialUI;
const {useState}=React;
${THEME}
function Section({label,children}){return <Box sx={{mb:2.5}}><Typography variant="caption" sx={{textTransform:'uppercase',letterSpacing:1,color:'text.secondary',fontWeight:700,display:'block',mb:1}}>{label}</Typography>{children}</Box>;}
${helpers}
function Demo(){return <ThemeProvider theme={theme}><CssBaseline/><Box sx={{p:2.5,maxWidth:420,mx:'auto'}}>${body}</Box></ThemeProvider>;}
ReactDOM.createRoot(document.getElementById('root')).render(<Demo/>);
</script></body></html>`;

// ── Swatch helper reused by the colour card ──────────────────────────────────
const swatchRow = `function Sw({name,hex,fg='#fff'}){return <Box sx={{flex:'1 1 30%',minWidth:96,bgcolor:hex,color:fg,borderRadius:2,p:1,height:64,display:'flex',flexDirection:'column',justifyContent:'flex-end',border:'1px solid rgba(0,0,0,0.06)'}}><Typography sx={{fontSize:'0.7rem',fontWeight:700,lineHeight:1.1}}>{name}</Typography><Typography sx={{fontSize:'0.62rem',opacity:0.85}}>{hex}</Typography></Box>;}
function Row({children}){return <Box sx={{display:'flex',flexWrap:'wrap',gap:1,mb:1}}>{children}</Box>;}`;

const cards = [
  {
    file: 'colors.html', group: 'Foundations', title: 'Color palette',
    helpers: swatchRow,
    body: `
      <Typography variant="h2" sx={{mb:2}}>Color</Typography>
      <Section label="Brand — primary & secondary">
        <Row><Sw name="primary" hex="#EA5347"/><Sw name="primary.dark" hex="#C13A2E"/><Sw name="secondary" hex="#EFB666" fg="#212121"/></Row>
      </Section>
      <Section label="Brand accents">
        <Row><Sw name="teal" hex="#98D2CD" fg="#212121"/><Sw name="tealDeep" hex="#3E9B95"/><Sw name="pink" hex="#FFB3B9" fg="#212121"/><Sw name="pinkDeep" hex="#E06B8D"/><Sw name="black" hex="#1A1A1A"/></Row>
      </Section>
      <Section label="Semantic (functional, kept distinct from brand)">
        <Row><Sw name="error" hex="#C62828"/><Sw name="warning" hex="#E8850C" fg="#212121"/><Sw name="success" hex="#2E7D46"/><Sw name="info" hex="#147A70"/></Row>
      </Section>
      <Section label="Surfaces & text">
        <Row><Sw name="bg.default" hex="#FAFAF8" fg="#212121"/><Sw name="paper" hex="#FFFFFF" fg="#212121"/><Sw name="surface.subtle" hex="#F5F5F2" fg="#212121"/><Sw name="surface.muted" hex="#F0F0EC" fg="#212121"/><Sw name="text.primary" hex="#2E2E2E"/><Sw name="text.secondary" hex="#6B7078"/></Row>
      </Section>`
  },
  {
    file: 'typography.html', group: 'Foundations', title: 'Typography & wordmark',
    body: `<Box sx={{textAlign:'center',mb:3}}>
        <Typography sx={{fontFamily:DISPLAY_FONT,letterSpacing:'0.4em',fontSize:'0.9rem',color:'text.primary',ml:'0.4em',mb:0.5}}>FUNDACIÓN</Typography>
        <Typography sx={{fontFamily:DISPLAY_FONT,fontSize:'3.4rem',lineHeight:0.9,color:'brand.black',letterSpacing:'0.5px'}}>PATAS<br/>ARRIBA</Typography>
      </Box>
      <Divider sx={{mb:2}}/>
      <Section label="Display — Staatliches">
        <Typography variant="h1">Eventos</Typography>
        <Typography variant="h2">Información</Typography>
      </Section>
      <Section label="Headings & UI — Roboto">
        <Typography variant="h3">Título de sección (h3)</Typography>
        <Typography variant="h5">Subsección (h5)</Typography>
      </Section>
      <Section label="Body — MUI defaults (16 / 14 / 12)">
        <Typography variant="body1">body1 · 16px — texto principal legible en móvil.</Typography>
        <Typography variant="body2" color="text.secondary">body2 · 14px — texto secundario.</Typography>
        <Typography variant="caption" color="text.secondary" sx={{display:'block'}}>caption · 12px — etiquetas y metadatos.</Typography>
      </Section>`
  },
  {
    file: 'buttons.html', group: 'Components', title: 'Buttons',
    body: `<Typography variant="h2" sx={{mb:2}}>Buttons</Typography>
      <Section label="Primary (coral) · 48px touch target">
        <Stack spacing={1.5}>
          <Button variant="contained" fullWidth size="large">Iniciar sesión</Button>
          <Stack direction="row" spacing={1}><Button variant="contained">Unirme</Button><Button variant="contained" disabled>Deshabilitado</Button></Stack>
        </Stack>
      </Section>
      <Section label="Secondary & outlined">
        <Stack direction="row" spacing={1}><Button variant="contained" color="secondary">Socio/a</Button><Button variant="outlined" sx={{borderColor:'divider',color:'text.primary'}}>Buscar</Button></Stack>
      </Section>
      <Section label="Destructive (error, distinct from coral)">
        <Stack direction="row" spacing={1}><Button variant="contained" color="error">Eliminar</Button><Button variant="outlined" sx={{color:'error.main',borderColor:'error.main'}}>Abandonar</Button></Stack>
      </Section>
      <Section label="Text & icon">
        <Stack direction="row" spacing={1} alignItems="center"><Button startIcon={<MI name="arrow_back" sx={{fontSize:18}}/>} sx={{color:'text.secondary'}}>Volver</Button><IconButton sx={{bgcolor:'primary.main',color:'primary.contrastText'}}><MI name="send" sx={{fontSize:18}}/></IconButton></Stack>
      </Section>`
  },
  {
    file: 'chips-categories.html', group: 'Components', title: 'Chips, badges & categories',
    body: `<Typography variant="h2" sx={{mb:2}}>Chips & categories</Typography>
      <Section label="Time badges">
        <Stack direction="row" spacing={1}><Chip label="Hoy" size="small" color="secondary"/><Chip label="Próximo" size="small" color="primary"/><Chip label="Pasado" size="small" variant="outlined"/></Stack>
      </Section>
      <Section label="Role chips">
        <Stack direction="row" spacing={1}><Chip label="Admin" size="small" color="primary" variant="outlined"/><Chip label="Org" size="small" color="secondary" variant="outlined"/><Chip label="Pendiente" size="small" color="warning"/></Stack>
      </Section>
      <Section label="Categories — one unified vocabulary (events + glossary)">
        <Box sx={{display:'flex',flexWrap:'wrap',gap:1}}>
          {Object.entries(CATEGORY).map(([k,c])=><Chip key={k} label={k} size="small" sx={{bgcolor:c.main,color:c.contrastText,textTransform:'capitalize'}}/>) }
        </Box>
      </Section>
      <Section label="Status">
        <Stack direction="row" spacing={1}><Chip label="Cerrado" size="small" color="warning"/><Chip icon={<MI name="group" sx={{fontSize:14}}/>} label="5" size="small" variant="outlined" sx={{borderColor:'divider'}}/></Stack>
      </Section>`
  },
  {
    file: 'avatars.html', group: 'Components', title: 'Avatars (derived colors)',
    body: `<Typography variant="h2" sx={{mb:2}}>Avatars</Typography>
      <Typography variant="body2" color="text.secondary" sx={{mb:2}}>Colors are derived from the brand ring via a stable hash of the username — never stored per user.</Typography>
      <Section label="Sizes">
        <Stack direction="row" spacing={1.5} alignItems="center">
          {[24,36,48,64].map(s=>{const c=avatarColorFor('maria_v');return <Avatar key={s} sx={{bgcolor:c,width:s,height:s,fontSize:s*0.4,fontWeight:700}}>MV</Avatar>;})}
        </Stack>
      </Section>
      <Section label="Derived across users">
        <Stack direction="row" spacing={1} sx={{flexWrap:'wrap',gap:1}}>
          {[['maria_v','MV'],['carlos_r','CR'],['lucia_m','LM'],['pablo_g','PG'],['ana_s','AS'],['nuevo_user','PL']].map(([u,i])=><Avatar key={u} sx={{bgcolor:avatarColorFor(u),width:44,height:44,fontSize:16,fontWeight:700}}>{i}</Avatar>)}
        </Stack>
      </Section>`
  },
  {
    file: 'cards.html', group: 'Components', title: 'Cards',
    body: `<Typography variant="h2" sx={{mb:2}}>Cards</Typography>
      <Section label="Event card (category accent bar)">
        <Card sx={{position:'relative',overflow:'visible',mb:1}}>
          <Box sx={{position:'absolute',top:0,left:0,width:4,height:'100%',bgcolor:CATEGORY.protectora.main,borderRadius:'4px 0 0 4px'}}/>
          <CardContent sx={{pl:2.5}}>
            <Box sx={{display:'flex',justifyContent:'space-between',alignItems:'center',mb:1}}>
              <Chip label="Próximo" size="small" color="primary"/>
              <Box sx={{display:'flex',alignItems:'center',gap:0.5}}><MI name="pets" sx={{fontSize:16,color:CATEGORY.protectora.main}}/><Typography variant="caption" color="text.secondary">protectora</Typography></Box>
            </Box>
            <Typography variant="h3" sx={{mb:1}}>Visita a la Protectora</Typography>
            <Box sx={{display:'flex',alignItems:'center',gap:0.75}}><MI name="place" sx={{fontSize:16,color:'text.secondary'}}/><Typography variant="body2" color="text.secondary">Protectora Municipal, C/ Esperanza 12</Typography></Box>
          </CardContent>
        </Card>
      </Section>
      <Section label="Info panel (surface.subtle)">
        <Card variant="outlined" sx={{bgcolor:'surface.subtle',border:'none'}}><CardContent>
          <Stack spacing={0.75}>
            <Box sx={{display:'flex',alignItems:'center',gap:1}}><MI name="event" sx={{fontSize:18,color:'text.secondary'}}/><Typography variant="body2">dom, 5 abr · 10:00</Typography></Box>
            <Box sx={{display:'flex',alignItems:'center',gap:1}}><MI name="group" sx={{fontSize:18,color:'text.secondary'}}/><Typography variant="body2">5 participantes</Typography></Box>
          </Stack>
        </CardContent></Card>
      </Section>`
  },
  {
    file: 'inputs-nav.html', group: 'Components', title: 'Inputs & navigation',
    body: `<Typography variant="h2" sx={{mb:2}}>Inputs & navigation</Typography>
      <Section label="Text fields (16px — no iOS zoom)">
        <Stack spacing={2}>
          <TextField label="Usuario" fullWidth InputProps={{startAdornment:<InputAdornment position="start"><MI name="person" sx={{fontSize:20,color:'text.secondary'}}/></InputAdornment>}}/>
          <TextField label="Contraseña" type="password" fullWidth/>
          <TextField placeholder="Buscar..." fullWidth size="small" sx={{'& .MuiOutlinedInput-root':{borderRadius:'24px',bgcolor:'surface.subtle'}}} InputProps={{startAdornment:<InputAdornment position="start"><MI name="search" sx={{fontSize:20,color:'text.secondary'}}/></InputAdornment>}}/>
        </Stack>
      </Section>
      <Section label="Bottom navigation">
        <Paper elevation={0} sx={{borderTop:'1px solid',borderColor:'divider'}}>
          <BottomNavigation value={0} showLabels sx={{bgcolor:'background.paper',height:64,'& .Mui-selected':{color:'#EA5347'}}}>
            <BottomNavigationAction label="Eventos" icon={<MI name="event"/>}/>
            <BottomNavigationAction label="Información" icon={<MI name="info"/>}/>
            <BottomNavigationAction label="Perfil" icon={<MI name="person"/>}/>
          </BottomNavigation>
        </Paper>
      </Section>`
  },
];

for (const c of cards) writeFileSync(join(outDir, c.file), page(c));
console.log(`Wrote ${cards.length} cards to ${outDir}`);

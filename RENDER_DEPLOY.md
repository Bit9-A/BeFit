# ===========================================

# BeFit Backend - Render Deployment Guide

# ===========================================

## Opción 1: Deploy Manual (Recomendado para primera vez)

1. Ve a [render.com](https://render.com) y crea una cuenta
2. Click en **New** → **Web Service**
3. Conecta tu repositorio de GitHub
4. Configura:
   - **Name**: `befit-api`
   - **Region**: Oregon (o la más cercana a ti)
   - **Root Directory**: `backend` ← ¡IMPORTANTE!
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free

5. En **Environment Variables**, agrega:
   | Key | Value |
   |-----|-------|
   | `NODE_ENV` | `production` |
   | `GEMINI_API_KEY` | Tu API key de Google AI |
   | `SUPABASE_URL` | Tu URL de Supabase |
   | `SUPABASE_KEY` | Tu anon key de Supabase |

6. Click **Create Web Service**

## Opción 2: Deploy con Blueprint (render.yaml)

1. El archivo `render.yaml` ya está en la raíz del repo
2. Ve a Render Dashboard → **New** → **Blueprint**
3. Selecciona el repositorio
4. Render detectará automáticamente el `render.yaml`
5. Configura las variables de entorno marcadas como `sync: false`
6. Click **Apply**

## Después del Deploy

Tu API estará disponible en:

```
https://befit-api.onrender.com/api
```

Actualiza tu app móvil con la nueva URL:

```env
# En app/.env
EXPO_PUBLIC_API_URL=https://befit-api.onrender.com/api
```

## Endpoints Disponibles

| Método | Endpoint                 | Descripción             |
| ------ | ------------------------ | ----------------------- |
| GET    | `/health`                | Health check            |
| POST   | `/api/calculate-metrics` | Calcular BMI, TMB, TDEE |
| POST   | `/api/generate-routine`  | Generar rutina con IA   |
| POST   | `/api/analyze-fridge`    | Analizar foto de nevera |
| POST   | `/api/chat`              | Chat con terapeuta IA   |
| POST   | `/api/daily-feed`        | Feed de bienestar       |

## Notas Importantes

⚠️ El plan gratuito de Render:

- Se "duerme" después de 15 minutos de inactividad
- La primera request después del sleep tarda ~30 segundos
- Para evitar esto, puedes usar un servicio como UptimeRobot para hacer ping cada 14 minutos

## Troubleshooting

**Error: "Cannot find module"**

- Asegúrate de que `Root Directory` esté configurado como `backend`

**Error: "Port already in use"**

- Render asigna el puerto automáticamente vía `process.env.PORT`

**La API no responde**

- Revisa los logs en Render Dashboard
- Verifica que las variables de entorno estén configuradas

###################
# BUILD FOR LOCAL DEVELOPMENT
###################
FROM node:22-alpine AS development
WORKDIR /usr/src/app

# Copy package.json và package-lock.json để tận dụng cache layer
COPY --chown=node:node package*.json ./

# Cài đặt dependencies dành cho development
RUN npm ci

# Copy toàn bộ source code vào container
COPY --chown=node:node . .

# Use the node user from the image (instead of the root user)
USER node

###################
# BUILD FOR PRODUCTION
###################

FROM node:22-alpine AS build

WORKDIR /usr/src/app

COPY --chown=node:node package*.json ./

# In order to run `npm run build` we need access to the Nest CLI which is a dev dependency. 
#In the previous development stage we ran `npm ci` which installed all dependencies, 
#so we can copy over the node_modules directory from the development image
COPY --chown=node:node --from=development /usr/src/app/node_modules ./node_modules

COPY --chown=node:node . .

# Thực hiện migrate để chuẩn bị cho generate prisma client
# Package.json: script:  "migrate:prod": "dotenv -e .env.production -- npx prisma migrate deploy"
RUN npm run migrate:prod

# Generate Prisma Client
RUN npx prisma generate

# Build ứng dụng (nest build)
RUN npm run build

# Running `npm ci` removes the existing node_modules directory and passing in --only=production ensures that only the production dependencies are installed. This ensures that the node_modules directory is as optimized as possible
RUN npm ci --only=production && npm cache clean --force

USER node

# Yêu cầu: không copy file chứa env variables vào image 

###################
# PRODUCTION
###################

FROM node:22-alpine AS production

# Copy the bundled code from the build stage to the production image
COPY --chown=node:node --from=build /usr/src/app/node_modules ./node_modules
COPY --chown=node:node --from=build /usr/src/app/dist ./dist

# Start the server using the production build
CMD [ "node", "dist/src/main.js" ]



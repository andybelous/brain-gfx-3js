FROM public.ecr.aws/lambda/nodejs:14
# Define function directory
ARG FUNCTION_DIR="./"
ADD *.js *.png README.md package*.json ${FUNCTION_DIR}
ADD config ${FUNCTION_DIR}/config
ADD models ${FUNCTION_DIR}/models
RUN npm install
CMD ["server.handler"]
#ENTRYPOINT ["/var/task"]
